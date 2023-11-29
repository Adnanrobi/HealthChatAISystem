import os
from dotenv import load_dotenv
import json
import requests

load_dotenv()


class GPTService:
    def __init__(self):
        self.secret_key = os.getenv("OPENAI_SECRET_KEY")

    async def respond(self, user_input):
        URL = "https://api.openai.com/v1/chat/completions"

        payload = {
            "model": "gpt-3.5-turbo-16k",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an assistant only responding to medical related things keeping response in 50 words",
                },
                {"role": "user", "content": user_input},
            ],
            "stream": False,
        }

        # payload = {
        #     "model": "gpt-3.5-turbo-16k",
        #     "messages": [
        #         {"role": "system", "content": "You are a medical assistant."},
        #         {"role": "user", "content": user_input},
        #     ],
        #     "temperature": 1.0,
        #     "top_p": 1.0,
        #     "n": 1,
        #     "stream": False,
        #     "presence_penalty": 0,
        #     "frequency_penalty": 0,
        # }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.secret_key}",
        }

        response = requests.post(URL, headers=headers, json=payload, stream=False)
        response_data = json.loads(response.content.decode("utf-8"))
        # error_message = response_data["error"]["message"]
        print(response_data)
        assistant_message = response_data["choices"][0]["message"]["content"]
        print(assistant_message)

        return assistant_message
