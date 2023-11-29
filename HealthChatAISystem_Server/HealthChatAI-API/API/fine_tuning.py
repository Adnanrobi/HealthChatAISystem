import pandas as pd
import json

# Step 1: Read data from the Excel sheet
excel_file = "file.xlsx"  # Replace with the path to your Excel file
df = pd.read_excel(excel_file)

# Step 2: Preprocess the data and convert it into the desired format
# Depending on your use case and the structure of your data, you may need to adjust this part.

# For fine-tuning ChatGPT, you'll typically want a list of dialogues where each dialogue is a list of message dictionaries.
dialogues = []

for row in df.itertuples():
    # Assuming your Excel sheet has columns like 'User' and 'Assistant'
    user_message = str(row.User)
    assistant_message = str(row.Assistant)

    # Create message dictionaries
    user_message_dict = {"role": "user", "content": user_message}
    assistant_message_dict = {"role": "assistant", "content": assistant_message}

    # Create a dialogue by combining user and assistant messages
    dialogue = [user_message_dict, assistant_message_dict]
    dialogues.append(dialogue)

# Step 3: Save the data in a JSON file
output_file = "chatgpt_finetuning_data.json"

with open(output_file, "w") as json_file:
    json.dump(dialogues, json_file, indent=4)

print(f"Data has been converted and saved to {output_file}")
