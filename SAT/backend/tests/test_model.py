import unittest
from unittest.mock import patch

from app import model as model_module


class FakeTokenizer:
    def __init__(self, decoded):
        self.decoded = iter(decoded)
        self.last_source = None
        self.last_kwargs = None

    def __call__(self, source, **kwargs):
        self.last_source = source
        self.last_kwargs = kwargs
        return {"input_ids": object()}

    def decode(self, _output, **_kwargs):
        return next(self.decoded)


class FakeModel:
    def __init__(self):
        self.generate_calls = []

    def generate(self, **kwargs):
        self.generate_calls.append(kwargs)
        return [[1, 2, 3]]


class NeutralModelPromptTests(unittest.TestCase):
    def test_uses_neutral_prefix_without_sentence_type(self):
        tokenizer = FakeTokenizer(["(S (NP (PRO She)) (VP (V runs)))"])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            prediction = model_module.predict_s_expression("She runs.")

        self.assertEqual(tokenizer.last_source, "parse: She runs.")
        self.assertEqual(prediction, "(S (NP (PRO She)) (VP (V runs)))")
        self.assertEqual(len(fake_model.generate_calls), 1)

    def test_retries_once_when_primary_output_is_unbalanced(self):
        tokenizer = FakeTokenizer([
            "(S (NP (PRO She))",
            "(S (NP (PRO She)) (VP (V runs)))",
        ])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            prediction = model_module.predict_s_expression("She runs.")

        self.assertTrue(model_module.is_balanced_s_expression(prediction))
        self.assertEqual(len(fake_model.generate_calls), 2)
        self.assertEqual(fake_model.generate_calls[0]["num_beams"], model_module.MODEL_NUM_BEAMS)
        self.assertEqual(fake_model.generate_calls[1]["num_beams"], model_module.MODEL_RETRY_NUM_BEAMS)

    def test_rejects_output_when_both_attempts_are_unbalanced(self):
        tokenizer = FakeTokenizer(["(S (NP", "(S (VP"])
        fake_model = FakeModel()

        with patch.object(model_module, "load_model", return_value=(tokenizer, fake_model)):
            with self.assertRaises(model_module.ModelOutputError):
                model_module.predict_s_expression("She runs.")


if __name__ == "__main__":
    unittest.main()
