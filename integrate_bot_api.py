import re

def update_tools(content):
    # Replace any old IP or domain with the new Vercel API endpoint
    new_content = re.sub(
        r"https?://[^\s`]+/api/logs/add",
        "https://kyu-fit-app.vercel.app/api/logs/add",
        content
    )
    if "KyuFit API URL" not in new_content:
        pattern = r"(\* \*\*GCP Cloud VM\*\*:[^\n]+)"
        replacement = r"\1\n* **KyuFit API URL**: `https://kyu-fit-app.vercel.app/api/logs/add` (Endpoint to log food intake dynamically)"
        new_content, _ = re.subn(pattern, replacement, new_content)
    return new_content

def update_skill(content):
    new_content = re.sub(
        r"https?://[^\s`]+/api/logs/add",
        "https://kyu-fit-app.vercel.app/api/logs/add",
        content
    )
    return new_content

if __name__ == '__main__':
    try:
        with open('/home/parkee/.openclaw/workspace/TOOLS.md', 'r') as f:
            tools = f.read()
        tools_updated = update_tools(tools)
        with open('/home/parkee/.openclaw/workspace/TOOLS.md', 'w') as f:
            f.write(tools_updated)
        print("Updated TOOLS.md successfully!")
    except Exception as e:
        print(f"Error TOOLS.md: {e}")

    try:
        with open('/home/parkee/.openclaw/plugin-skills/calorie-tracker/SKILL.md', 'r') as f:
            skill = f.read()
        skill_updated = update_skill(skill)
        with open('/home/parkee/.openclaw/plugin-skills/calorie-tracker/SKILL.md', 'w') as f:
            f.write(skill_updated)
        print("Updated calorie-tracker/SKILL.md successfully!")
    except Exception as e:
        print(f"Error SKILL.md: {e}")
