import logging
import os
from dataclasses import dataclass
from pathlib import Path
from threading import Lock

import torch
from dotenv import load_dotenv
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from app.parser import s_expression_to_tree

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_ID = os.getenv("HF_MODEL_ID", "SAT-Project/SAT-T5-P8-V2-Baseline")
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


@dataclass(frozen=True)
class ModelPrediction:
    raw_model_output: str
    s_expression: str

    @property
    def output_modified(self) -> bool:
        return self.raw_model_output != self.s_expression


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


def repair_s_expression_parentheses(value: str) -> str | None:
    """Append only missing closing parentheses, then validate the repaired tree."""
    candidate = value.strip()
    if not candidate.startswith("("):
        return None

    depth = 0
    for char in candidate:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth < 0:
                # An extra closing parenthesis cannot be repaired safely by appending.
                return None

    if depth == 0:
        repaired = candidate
    else:
        repaired = candidate + (")" * depth)

    try:
        tree = s_expression_to_tree(repaired)
    except (IndexError, TypeError, ValueError):
        return None

    root_label = str(tree.get("name", "")).upper() if isinstance(tree, dict) else ""
    if root_label not in {"S", "S1"}:
        return None
    return repaired


def _tree_to_s_expression(node: dict) -> str:
    name = str(node.get("name", "")).strip()
    children = node.get("children")
    if not isinstance(children, list) or not children:
        return name
    return f"({name} {' '.join(_tree_to_s_expression(child) for child in children)})"


def repair_fragmented_compound(value: str) -> str | None:
    """Repair the model's known `(S ...) (Coord ...) (S2 ...)` fragmentation."""
    try:
        tree = s_expression_to_tree(value.strip())
    except (IndexError, TypeError, ValueError):
        return None

    if not isinstance(tree, dict) or str(tree.get("name", "")).upper() != "ROOT":
        return None
    children = tree.get("children")
    if not isinstance(children, list) or len(children) != 3:
        return None

    labels = [str(child.get("name", "")).upper() for child in children]
    if labels != ["S", "COORD", "S2"]:
        return None

    first_clause = dict(children[0])
    first_clause["name"] = "S1"
    repaired_tree = {
        "name": "S",
        "children": [first_clause, children[1], children[2]],
    }
    repaired = _tree_to_s_expression(repaired_tree)
    return repaired if is_balanced_s_expression(repaired) else None


def repair_s_expression(value: str) -> str | None:
    return (
        repair_s_expression_parentheses(value)
        or repair_fragmented_compound(value)
    )


def _generate_candidates(
    tokenizer,
    model,
    inputs,
    *,
    num_beams: int,
    max_target_length: int,
    num_return_sequences: int,
) -> list[str]:
    candidate_count = max(1, min(num_return_sequences, num_beams))
    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_length=max_target_length,
            num_beams=num_beams,
            num_return_sequences=candidate_count,
            early_stopping=True,
        )
    return [
        value.strip()
        for value in tokenizer.batch_decode(outputs, skip_special_tokens=True)
    ]


def _first_balanced_candidate(candidates: list[str]) -> str | None:
    return next(
        (candidate for candidate in candidates if is_balanced_s_expression(candidate)),
        None,
    )


def _first_repairable_candidate(candidates: list[str]) -> str | None:
    for candidate in candidates:
        repaired = repair_s_expression(candidate)
        if repaired is not None:
            return repaired
    return None


def predict_s_expression_result(sentence: str) -> ModelPrediction:
    tokenizer, model = load_model()
    source_text = MODEL_PROMPT_PREFIX + sentence
    inputs = tokenizer(
        source_text,
        return_tensors="pt",
        truncation=True,
        max_length=MODEL_MAX_SOURCE_LENGTH,
    )
    candidates = _generate_candidates(
        tokenizer,
        model,
        inputs,
        num_beams=MODEL_NUM_BEAMS,
        max_target_length=MODEL_MAX_TARGET_LENGTH,
        num_return_sequences=MODEL_NUM_BEAMS,
    )
    raw_model_output = candidates[0] if candidates else ""
    prediction = _first_balanced_candidate(candidates)
    if prediction is not None:
        return ModelPrediction(raw_model_output, prediction)

    logger.warning(
        "No balanced primary candidate; retrying with fallback decoding"
    )
    retry_candidates = _generate_candidates(
        tokenizer,
        model,
        inputs,
        num_beams=MODEL_RETRY_NUM_BEAMS,
        max_target_length=MODEL_RETRY_MAX_TARGET_LENGTH,
        num_return_sequences=MODEL_RETRY_NUM_BEAMS,
    )
    retry = _first_balanced_candidate(retry_candidates)
    if retry is not None:
        return ModelPrediction(raw_model_output, retry)


    repaired = _first_repairable_candidate(candidates + retry_candidates)
    if repaired is not None:
        logger.warning("Model output structure was repaired safely")
        return ModelPrediction(raw_model_output, repaired)
    raise ModelOutputError("The model did not produce a complete S-expression after retrying.")


def predict_s_expression(sentence: str) -> str:
    """Compatibility helper for callers that only need the final S-expression."""
    return predict_s_expression_result(sentence).s_expression
