# URL - https://app.prefect.cloud/account/1797712d-fb9c-4d75-9571-008639115317/workspace/bdd46c21-acb5-4a4f-8b16-692ae2cee3b7/dashboard

# Ref - https://app.prefect.cloud/api/docs

import requests

# Replace these variables with your actual Prefect Cloud credentials
PREFECT_API_KEY = "pnu_0loWGiVTPUCH91BscKlgp1TrYK21Gn102PZ3"  # Your Prefect Cloud API key
ACCOUNT_ID = "1797712d-fb9c-4d75-9571-008639115317"  # Your Prefect Cloud Account ID
WORKSPACE_ID = "bdd46c21-acb5-4a4f-8b16-692ae2cee3b7"  # Your Prefect Cloud Workspace ID

# Correct API URL to list flow runs
PREFECT_API_URL = f"https://api.prefect.cloud/api/accounts/{ACCOUNT_ID}/workspaces/{WORKSPACE_ID}/artifacts/filter"

# Data to filter artifacts
data = {
    "sort": "CREATED_DESC",
    "limit": 5,
    "artifacts": {
        "key": {
            "exists_": True
        }
    }
}

# Set up headers with Authorization
headers = {"Authorization": f"Bearer {PREFECT_API_KEY}"}

# Make the request
response = requests.post(PREFECT_API_URL, headers=headers, json=data)
print(response)

# Check the response status
if response.status_code != 200:
    print(f"Error: Received status code {response.status_code}")
    print(f"Response content: {response.text}")
else:
    artifacts = response.json()
    print(artifacts)
    for artifact in artifacts:
        print(artifact)
