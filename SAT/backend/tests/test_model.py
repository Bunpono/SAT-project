import unittest
from unittest.mock import patch

from app import model as model_module


class FakeTokenizer:
    def __init__(self, decoded):
        self.decoded_batches = iter(decoded)
        self.last_source = None
        self.last_kwargs = None

    def __call__(self, source, **kwargs):
        self.last_source = source
        self.last_kwargs = kwargs
        return {"input_ids": object()}

    def batch_decode(self, _outputs, **_kwargs):
        return next(self.decoded_batches)


class FakeModel:
    def __init__(self):
        self.generate_calls = []

    def generate(self, **kwargs):
        self.generate_calls.append(kwargs)
        return [[1, 2, 3]]


class NeutralModelPromptTests(unittest.TestCase):
    def test_uses_neutral_prefix_without_sentence_type(self):
        tokenizer = FakeTokenizer([["(S (NP (PRO She)) (VP (V runs)))"]])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            prediction = model_module.predict_s_expression("She runs.")

        self.assertEqual(tokenizer.last_source, "parse: She runs.")
        self.assertEqual(prediction, "(S (NP (PRO She)) (VP (V runs)))")
        self.assertEqual(len(fake_model.generate_calls), 1)

    def test_selects_balanced_candidate_without_retry(self):
        tokenizer = FakeTokenizer([
            ["(S (NP (PRO She))", "(S (NP (PRO She)) (VP (V runs)))"],
        ])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            prediction = model_module.predict_s_expression("She runs.")

        self.assertTrue(model_module.is_balanced_s_expression(prediction))
        self.assertEqual(len(fake_model.generate_calls), 1)
        self.assertEqual(fake_model.generate_calls[0]["num_beams"], model_module.MODEL_NUM_BEAMS)
        self.assertEqual(
            fake_model.generate_calls[0]["num_return_sequences"],
            model_module.MODEL_NUM_BEAMS,
        )

    def test_rejects_output_when_both_attempts_are_unbalanced(self):
        tokenizer = FakeTokenizer([
            [") (S (NP", "not an s-expression"],
            [") (S (NP", "not an s-expression"],
        ])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            with self.assertRaises(model_module.ModelOutputError):
                model_module.predict_s_expression("She runs.")

    def test_repairs_missing_closing_parentheses_after_retry(self):
        incomplete = "(S (NP (PRO She)) (VP (V runs))"
        tokenizer = FakeTokenizer([
            [incomplete],
            [incomplete],
        ])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            prediction = model_module.predict_s_expression("She runs.")

        self.assertEqual(prediction, "(S (NP (PRO She)) (VP (V runs)))")
        self.assertTrue(model_module.is_balanced_s_expression(prediction))
        self.assertEqual(len(fake_model.generate_calls), 2)

    def test_does_not_repair_extra_closing_parenthesis(self):
        self.assertIsNone(
            model_module.repair_s_expression_parentheses("(S (NP (PRO She)))))")
        )

    def test_does_not_repair_non_sentence_root(self):
        self.assertIsNone(
            model_module.repair_s_expression_parentheses("(NP (PRO She)")
        )

    def test_repairs_fragmented_compound_to_project_shape(self):
        fragmented = (
            "(S (NP (PRO I)) (VP (V like) (NP (N tea)))) "
            "(Coord and) (S2 (NP (PRO she)) (VP (V likes) (NP (N coffee)))))"
        )

        repaired = model_module.repair_s_expression(fragmented)

        self.assertEqual(
            repaired,
            "(S (S1 (NP (PRO I)) (VP (V like) (NP (N tea)))) "
            "(Coord and) (S2 (NP (PRO she)) (VP (V likes) (NP (N coffee)))))",
        )
        self.assertTrue(model_module.is_balanced_s_expression(repaired))

    def test_does_not_guess_unknown_fragment_sequence(self):
        self.assertIsNone(
            model_module.repair_s_expression(
                "(S (NP (PRO I)) (VP (V run))) (Adv then) (S2 (VP (V stop)))"
            )
        )


if __name__ == "__main__":
    unittest.main()
