import logging
import os
from pathlib import Path
from threading import Lock

import torch
from dotenv import load_dotenv
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_ID = os.getenv("HF_MODEL_ID", "SAT-Project/SAT-Model-T1")
HF_TOKEN = os.getenv("HF_TOKEN", "").strip()
DEFAULT_CACHE_DIR = Path(__file__).resolve().parents[1] / ".cache" / "huggingface"
MODEL_CACHE_DIR = Path(os.getenv("HF_MODEL_CACHE_DIR", DEFAULT_CACHE_DIR)).expanduser()

_tokenizer = None
_model = None
_load_lock = Lock()


class ModelLoadError(RuntimeError):
    """Raised when the configured Hugging Face model cannot be loaded."""


def get_model_status() -> dict:
    return {
        "model_id": MODEL_ID,
        "loaded": _tokenizer is not None and _model is not None,
        "cache_dir": str(MODEL_CACHE_DIR),
    }


def _load_from_hugging_face():
    if not HF_TOKEN:
        raise ModelLoadError(
            "Hugging Face access is not configured. Add a valid HF_TOKEN to the backend environment."
        )

    MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    try:
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID,
            token=HF_TOKEN,
            cache_dir=MODEL_CACHE_DIR,
        )
        model = AutoModelForSeq2SeqLM.from_pretrained(
            MODEL_ID,
            token=HF_TOKEN,
            cache_dir=MODEL_CACHE_DIR,
        )
        model.eval()
        return tokenizer, model
    except Exception as exc:
        logger.exception("Unable to load Hugging Face model %s", MODEL_ID)
        raise ModelLoadError(
            f"The analysis model could not be loaded. Check that HF_TOKEN has read access to {MODEL_ID}."
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


def predict_s_expression(sentence: str) -> str:
    tokenizer, model = load_model()
    inputs = tokenizer(
        sentence,
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
