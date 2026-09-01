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
DEFAULT_CACHE_DIR = Path(__file__).resolve().parents[1] / ".cache" / "huggingface"
MODEL_CACHE_DIR = Path(os.getenv("HF_MODEL_CACHE_DIR", DEFAULT_CACHE_DIR)).expanduser()

_tokenizer = None
_model = None
_load_lock = Lock()

INSTRUCTION_PREFIXES = {
    "Simple": "parse simple: ",
    "Compound": "parse compound: ",
    "Complex": "parse complex: ",
}


class ModelLoadError(RuntimeError):
    """Raised when the configured Hugging Face model cannot be loaded."""


def get_model_status() -> dict:
    return {
        "model_id": MODEL_ID,
        "model_subfolder": MODEL_SUBFOLDER or None,
        "loaded": _tokenizer is not None and _model is not None,
        "cache_dir": str(MODEL_CACHE_DIR),
    }


def _load_from_hugging_face():
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


def predict_s_expression(sentence: str, sentence_type: str) -> str:
    tokenizer, model = load_model()
    try:
        source_text = INSTRUCTION_PREFIXES[sentence_type] + sentence
    except KeyError as exc:
        raise ValueError(f"Unsupported sentence type: {sentence_type}") from exc
    inputs = tokenizer(
        source_text,
        return_tensors="pt",
        truncation=True,
        max_length=128,
    )

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_length=256,
            num_beams=4,
            early_stopping=True,
        )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)
