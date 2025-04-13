# URL - https://app.prefect.cloud/account/1797712d-fb9c-4d75-9571-008639115317/workspace/bdd46c21-acb5-4a4f-8b16-692ae2cee3b7/dashboard

# URL - https://app.prefect.cloud/api/docs

import requests

# Replace these variables with your actual Prefect Cloud credentials
PREFECT_API_KEY = "pnu_0loWGiVTPUCH91BscKlgp1TrYK21Gn102PZ3"  # Your Prefect Cloud API key
ACCOUNT_ID = "1797712d-fb9c-4d75-9571-008639115317"  # Your Prefect Cloud Account ID
WORKSPACE_ID = "bdd46c21-acb5-4a4f-8b16-692ae2cee3b7"  # Your Prefect Cloud Workspace ID
FLOW_ID = "a14bf315-20e0-48be-919d-5028437fe689"  # Your Flow ID for workflow.py

# Correct API URL to get flow details
PREFECT_API_URL = f"https://api.prefect.cloud/api/accounts/{ACCOUNT_ID}/workspaces/{WORKSPACE_ID}/flows/{FLOW_ID}"

# Set up headers with Authorization
headers = {"Authorization": f"Bearer {PREFECT_API_KEY}"}

# Make the request using GET
response = requests.get(PREFECT_API_URL, headers=headers)

# Check the response status
if response.status_code == 200:
    flow_info = response.json()
    print(flow_info)
else:
    print(f"Error: Received status code {response.status_code}")
    print(f"Response content: {response.text}")
