import logging
import os
from pathlib import Path
from threading import Lock

import torch
from dotenv import load_dotenv
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_ID = os.getenv("HF_MODEL_ID", "SAT-Project/SAT-T5model-P8")
MODEL_SUBFOLDER = os.getenv("HF_MODEL_SUBFOLDER", "").strip()
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
MODEL_LOCAL_PATH = os.getenv("MODEL_LOCAL_PATH", "").strip()
MODEL_PROMPT_PREFIX = os.getenv("MODEL_PROMPT_PREFIX", "parse:").rstrip() + " "
MODEL_MAX_SOURCE_LENGTH = int(os.getenv("MODEL_MAX_SOURCE_LENGTH", "128"))
MODEL_MAX_TARGET_LENGTH = int(os.getenv("MODEL_MAX_TARGET_LENGTH", "384"))
MODEL_NUM_BEAMS = int(os.getenv("MODEL_NUM_BEAMS", "4"))
MODEL_RETRY_NUM_BEAMS = int(os.getenv("MODEL_RETRY_NUM_BEAMS", "8"))
MODEL_RETRY_MAX_TARGET_LENGTH = int(os.getenv("MODEL_RETRY_MAX_TARGET_LENGTH", "512"))
DEFAULT_CACHE_DIR = Path(__file__).resolve().parents[1] / ".cache" / "huggingface"
MODEL_CACHE_DIR = Path(os.getenv("HF_MODEL_CACHE_DIR", DEFAULT_CACHE_DIR)).expanduser()

_tokenizer = None
_model = None
_load_lock = Lock()

class ModelLoadError(RuntimeError):
    """Raised when the configured Hugging Face model cannot be loaded."""


class ModelOutputError(RuntimeError):
    """Raised when generation does not produce a parseable S-expression."""


def get_model_status() -> dict:
    return {
        "model_id": MODEL_ID,
        "model_subfolder": MODEL_SUBFOLDER or None,
        "model_local_path": MODEL_LOCAL_PATH or None,
        "prompt_prefix": MODEL_PROMPT_PREFIX,
        "loaded": _tokenizer is not None and _model is not None,
        "cache_dir": str(MODEL_CACHE_DIR),
    }


def _load_from_hugging_face():
    if MODEL_LOCAL_PATH:
        model_source = Path(MODEL_LOCAL_PATH).expanduser()
        if not model_source.is_absolute():
            model_source = Path(__file__).resolve().parents[1] / model_source
        if not model_source.exists():
            raise ModelLoadError(f"Local model path does not exist: {model_source}")
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_source)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_source)
            model.eval()
            return tokenizer, model
        except Exception as exc:
            logger.exception("Unable to load local model from %s", model_source)
            raise ModelLoadError(f"The local analysis model could not be loaded from {model_source}.") from exc

    if not HF_TOKEN:
        raise ModelLoadError(
            "Hugging Face access is not configured. Add a valid HF_TOKEN to the backend environment."
        )

    MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    hub_kwargs = {
        "token": HF_TOKEN,
        "cache_dir": MODEL_CACHE_DIR,
    }
    if MODEL_SUBFOLDER:
        hub_kwargs["subfolder"] = MODEL_SUBFOLDER

    try:
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID,
            **hub_kwargs,
        )
        model = AutoModelForSeq2SeqLM.from_pretrained(
            MODEL_ID,
            **hub_kwargs,
        )
        model.eval()
        return tokenizer, model
    except Exception as exc:
        logger.exception("Unable to load Hugging Face model %s", MODEL_ID)
        raise ModelLoadError(
            f"The analysis model could not be loaded. Check access and files for {MODEL_ID}."
        ) from exc


def load_model():
    global _tokenizer, _model

    if _tokenizer is not None and _model is not None:
        return _tokenizer, _model

    with _load_lock:
        if _tokenizer is None or _model is None:
            _tokenizer, _model = _load_from_hugging_face()
            logger.info("Hugging Face model loaded: %s", MODEL_ID)

    return _tokenizer, _model


def is_balanced_s_expression(value: str) -> bool:
    depth = 0
    saw_open = False
    for char in value.strip():
        if char == "(":
            saw_open = True
            depth += 1
        elif char == ")":
            depth -= 1
            if depth < 0:
                return False
    return saw_open and depth == 0


def _generate(tokenizer, model, inputs, *, num_beams: int, max_target_length: int) -> str:
    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_length=max_target_length,
            num_beams=num_beams,
            early_stopping=True,
        )
    return tokenizer.decode(outputs[0], skip_special_tokens=True).strip()


def predict_s_expression(sentence: str) -> str:
    tokenizer, model = load_model()
    source_text = MODEL_PROMPT_PREFIX + sentence
    inputs = tokenizer(
        source_text,
        return_tensors="pt",
        truncation=True,
        max_length=MODEL_MAX_SOURCE_LENGTH,
    )
    prediction = _generate(
        tokenizer,
        model,
        inputs,
        num_beams=MODEL_NUM_BEAMS,
        max_target_length=MODEL_MAX_TARGET_LENGTH,
    )
    if is_balanced_s_expression(prediction):
        return prediction

    logger.warning("Primary generation was not balanced; retrying with fallback decoding")
    retry = _generate(
        tokenizer,
        model,
        inputs,
        num_beams=MODEL_RETRY_NUM_BEAMS,
        max_target_length=MODEL_RETRY_MAX_TARGET_LENGTH,
    )
    if is_balanced_s_expression(retry):
        return retry
    raise ModelOutputError("The model did not produce a complete S-expression after retrying.")
