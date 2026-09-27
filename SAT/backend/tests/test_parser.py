import unittest

from app.parser import s_expression_to_tree


class SExpressionParserTests(unittest.TestCase):
    def test_keeps_multiword_lexical_value_in_one_terminal(self):
        tree = s_expression_to_tree(
            "(S (NP (PRO I)) (VP (V hope to hear) (PP (P from) (NP (PRO you)))))"
        )

        verb = tree["children"][1]["children"][0]

        self.assertEqual(
            verb,
            {"name": "V", "children": [{"name": "hope to hear"}]},
        )

    def test_keeps_nested_constituents_as_separate_children(self):
        tree = s_expression_to_tree("(VP (V runs) (AdvP (Adv quickly)))")

        self.assertEqual([child["name"] for child in tree["children"]], ["V", "AdvP"])


if __name__ == "__main__":
    unittest.main()
