import unittest

from app.parser import s_expression_to_tree
from app.tree_analysis import classify_sentence_type


class SentenceTypeClassificationTests(unittest.TestCase):
    def classify(self, expression: str) -> str:
        return classify_sentence_type(s_expression_to_tree(expression))

    def test_simple_sentence(self):
        self.assertEqual(
            self.classify("(S (NP (PRO She)) (VP (Vgp (V runs)))))"),
            "Simple",
        )

    def test_compound_sentence(self):
        self.assertEqual(
            self.classify(
                "(S (S1 (NP (PRO I)) (VP (Vgp (V read)))) "
                "(COORD and) (S2 (NP (PRO she)) (VP (Vgp (V writes)))))"
            ),
            "Compound",
        )

    def test_complex_sentence(self):
        self.assertEqual(
            self.classify(
                "(S1 (NP (DET The) (N woman) "
                "(S2 (PRO who) (VP (Vgp (V sings))))) "
                "(VP (Vgp (V smiles))))"
            ),
            "Complex",
        )

    def test_s_root_is_simple_even_when_it_contains_nested_s2(self):
        self.assertEqual(
            self.classify(
                "(S (NP (PRO She)) (VP (V says) (S2 (NP (PRO he)) (VP (V runs)))))"
            ),
            "Simple",
        )

    def test_s1_without_nested_s2_defaults_to_simple(self):
        self.assertEqual(
            self.classify("(S1 (NP (PRO She)) (VP (V runs)))"),
            "Simple",
        )


if __name__ == "__main__":
    unittest.main()
