import re


COORDINATOR_LABELS = {"COORD"}


def _children(node: dict | None) -> list[dict]:
    if not isinstance(node, dict):
        return []
    children = node.get("children")
    return [child for child in children if isinstance(child, dict)] if isinstance(children, list) else []


def _label(node: dict | None) -> str:
    name = node.get("name", "") if isinstance(node, dict) else ""
    return re.split(r"[-=]", str(name).strip().upper(), maxsplit=1)[0]


def _contains_label(node: dict | None, expected: str) -> bool:
    return any(
        _label(child) == expected or _contains_label(child, expected)
        for child in _children(node)
    )


def classify_sentence_type(tree: dict) -> str:
    """Classify from the model's project-specific S-expression shape."""
    root_label = _label(tree)
    direct_labels = [_label(child) for child in _children(tree)]

    if (
        root_label == "S"
        and len(direct_labels) == 3
        and direct_labels[0] == "S1"
        and direct_labels[1] in COORDINATOR_LABELS
        and direct_labels[2] == "S2"
    ):
        return "Compound"

    if root_label == "S1" and _contains_label(tree, "S2"):
        return "Complex"

    return "Simple"
