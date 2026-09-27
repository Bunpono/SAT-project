import re


COORDINATOR_LABELS = {"CC", "CONJ", "CONJP", "COORD"}


def _children(node: dict | None) -> list[dict]:
    if not isinstance(node, dict):
        return []
    children = node.get("children")
    return [child for child in children if isinstance(child, dict)] if isinstance(children, list) else []


def _label(node: dict | None) -> str:
    name = node.get("name", "") if isinstance(node, dict) else ""
    return re.split(r"[-=]", str(name).strip().upper(), maxsplit=1)[0]


def _is_clause(node: dict | None) -> bool:
    return re.fullmatch(r"S\d*", _label(node)) is not None


def _has_coordinator(node: dict | None) -> bool:
    return _label(node) in COORDINATOR_LABELS or any(
        _has_coordinator(child) for child in _children(node)
    )


def _has_coordinated_clauses(node: dict | None) -> bool:
    children = _children(node)
    clause_count = sum(_is_clause(child) for child in children)
    if clause_count >= 2 and any(_has_coordinator(child) for child in children):
        return True
    return any(_has_coordinated_clauses(child) for child in children)


def classify_sentence_type(tree: dict) -> str:
    """Classify only from the clause structure produced by the model."""
    clause_roles: list[str] = []

    def collect(node: dict, role: str = "independent") -> None:
        children = _children(node)
        is_clause = _is_clause(node)
        direct_clauses = [child for child in children if _is_clause(child)]
        is_coordination_wrapper = (
            is_clause
            and len(direct_clauses) >= 2
            and any(_has_coordinator(child) for child in children)
        )

        if is_clause and not is_coordination_wrapper:
            clause_roles.append(role)

        for child in children:
            child_role = role
            if is_coordination_wrapper and _is_clause(child):
                child_role = "independent"
            elif is_clause and not is_coordination_wrapper:
                child_role = "dependent"
            collect(child, child_role)

    collect(tree)
    dependent_count = clause_roles.count("dependent")
    independent_count = clause_roles.count("independent")

    if dependent_count:
        return "Complex"
    if independent_count >= 2 and _has_coordinated_clauses(tree):
        return "Compound"
    return "Simple"
