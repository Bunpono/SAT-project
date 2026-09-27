import re


def tokenize_s_expression(s_expression: str):
    return re.findall(r"\(|\)|[^\s()]+", s_expression)


def parse_tokens(tokens):
    if not tokens:
        return None

    token = tokens.pop(0)

    if token == "(":
        label = tokens.pop(0)
        node = {"name": label, "children": []}

        while tokens and tokens[0] != ")":
            # Consecutive bare tokens belong to the same lexical value.
            # For example, (V hope to hear) is one V terminal rather than
            # three sibling nodes named "hope", "to", and "hear".
            if tokens[0] != "(":
                lexical_tokens = []
                while tokens and tokens[0] not in {"(", ")"}:
                    lexical_tokens.append(tokens.pop(0))
                if lexical_tokens:
                    node["children"].append({"name": " ".join(lexical_tokens)})
                continue

            child = parse_tokens(tokens)
            if child:
                node["children"].append(child)

        if tokens and tokens[0] == ")":
            tokens.pop(0)

        if not node["children"]:
            node.pop("children")

        return node

    if token == ")":
        return None

    return {"name": token}


def s_expression_to_tree(s_expression: str):
    tokens = tokenize_s_expression(s_expression)
    children = []

    while tokens:
        child = parse_tokens(tokens)
        if child:
            children.append(child)

    if len(children) == 1:
        return children[0]

    return {
        "name": "ROOT",
        "children": children
    }
