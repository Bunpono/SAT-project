from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from huggingface_hub import login
from dotenv import load_dotenv
import os

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

MODEL_NAME = "SAT-Project/SAT-Model-T1"

tokenizer = None
model = None


def load_model():
    global tokenizer, model

    if tokenizer is None or model is None:

        login(token=HF_TOKEN)

        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            token=HF_TOKEN
        )

        model = AutoModelForSeq2SeqLM.from_pretrained(
            MODEL_NAME,
            token=HF_TOKEN
        )

        print("✅ Model Loaded Successfully")

    return tokenizer, model