import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Load dataset
data = pd.read_csv("expenses_dataset.csv")

# Split text and labels
X = data["text"]
y = data["category"]

# Convert text into numerical vectors
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

# Train model
model = LogisticRegression()
model.fit(X_vec, y)

# Save model and vectorizer
joblib.dump(model, "expense_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model trained successfully!")