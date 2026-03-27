import os
import json
import requests

GOCLAW_URL = os.getenv("GOCLAW_GATEWAY_URL", "http://localhost:18790")
GOCLAW_TOKEN = os.getenv("GOCLAW_GATEWAY_TOKEN", "eudaimonia_secret_token")

def register_skill(skill_slug):
    """
    Registers a Claude skill already present in the skills directory to the GoClaw DB.
    """
    url = f"{GOCLAW_URL}/v1/skills/publish"
    headers = {
        "Authorization": f"Bearer {GOCLAW_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "slug": skill_slug,
        "path": f"/app/skills/{skill_slug}"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Skill '{skill_slug}' successfully registered.")
    except Exception as e:
        print(f"Error registering skill: {e}")

if __name__ == "__main__":
    register_skill("eudaimonia_core")
