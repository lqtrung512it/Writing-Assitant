import os
import openai
import requests

# Store API key
os.environ["OPENAI_API_KEY"] = "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"
openai.api_key = os.getenv("OPENAI_API_KEY")

# API for all feature


def callOpenAiApi(prompt, model, max_tokens, temperature, top_p, n):

    response = openai.Completion.create(
        engine=model,
        prompt=prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        n=n,
    )

    return response.choices

# Parameters for each feature


def callFunctionApi(pathname, firstUserInput, language):
    if pathname == "grammar-checker":
        userInput = f"Please check the grammar of the following {language} sentences:" + firstUserInput
        return callOpenAiApi(
            userInput, "text-davinci-003", 150, 0.2, 1, 1)
    elif pathname == "plagiarism-checker":
        # Another API for check plagiarism
        url = "https://plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com/plagiarism"

        payload = {
            "text": f"{firstUserInput}",
            "language": "en",
            "includeCitations": False,
            "scrapeSources": False
        }
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": "6d0bedcfe7msh2cb5c3782f6d4f1p11258cjsn8dc37ffdb1dc",
            "X-RapidAPI-Host": "plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com"
        }

        response = requests.post(url, json=payload, headers=headers)

        return response.json()
    elif pathname == "text-completion":
        userInput = f"Please continue to write the following sentencesto complete the meaning {language} sentence, maximum is 3 sentences:" + firstUserInput

        return callOpenAiApi(
            userInput, "text-davinci-003", 75, 0.8, 1.0, 3)
    elif pathname == "paraphraser":
        userInput = "Please paraphrase the following sentences:" + \
            firstUserInput + "that keep the same meaning."
        return callOpenAiApi(userInput, "text-davinci-003", 75, 1.0, 1.0, 3)
    elif pathname == "translator":
        userInput = f"Translate the following sentence from Vietnameese to {language} sentences:" + firstUserInput

        return callOpenAiApi(userInput, "text-davinci-003", 150, 0.8, 1.0, 1)
    elif pathname == "third-converter":
        userInput = f"Convert the following sentence to third person:" + firstUserInput

        return callOpenAiApi(userInput, "text-davinci-003", 150, 0.8, 1.0, 1)
    else:
        return "Invalid pathname"
