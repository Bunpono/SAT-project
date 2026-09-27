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


if __name__ == "__main__":
    unittest.main()
