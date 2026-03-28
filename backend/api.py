from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
from pathlib import Path

app = FastAPI()

# Allow requests from React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where this script is located
script_dir = Path(__file__).parent

# Load ML model
model = joblib.load(script_dir / "expense_model.pkl")
vectorizer = joblib.load(script_dir / "vectorizer.pkl")


@app.post("/predict")
def predict(data: dict):

    text = data["text"]

    X = vectorizer.transform([text])

    category = model.predict(X)[0]

    return {"category": category}