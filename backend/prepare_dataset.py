import pandas as pd

data = pd.read_csv("personal_expense_classification.csv")

# combine merchant + description
data["text"] = data["merchant"] + " " + data["description"]

dataset = data[["text","category"]]

dataset.to_csv("expenses_dataset.csv", index=False)

print("Dataset created")