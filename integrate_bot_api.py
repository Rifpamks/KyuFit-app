import re

def update_tools(content):
    if "KyuFit API URL" in content:
        return content, 0
    
    # We find the line with GCP Cloud VM and append our API URL line after it
    pattern = r"(\* \*\*GCP Cloud VM\*\*:[^\n]+)"
    replacement = r"\1\n* **KyuFit API URL**: `http://10.70.63.91:3000/api/logs/add` (Endpoint to log food intake dynamically)"
    new_content, count = re.subn(pattern, replacement, content)
    return new_content, count

def update_skill(content):
    pattern = r"(2\.\s+\*\*Logging Food Intake:\*\*\n\s+-\s+When the user confirms[^\n]+\n\s+-\s+Each entry must contain:[^\n]+)"
    
    replacement = """2. **Logging Food Intake:**
   - When the user confirms (e.g., "ya", "catat", "log") or manually requests to add a food item, perform the following two actions:
     1. **Write locally:** Append the entry to the JSON file `/home/parkee/.openclaw/workspace/calorie_log.json`. Each entry must contain: `timestamp` (ISO string), `food_name`, `calories` (number), `protein` (number), `carbs` (number), `fats` (number).
     2. **Write to KyuFit Database (API):**
        * Read the **KyuFit API URL** from `/home/parkee/.openclaw/workspace/TOOLS.md` (e.g., `http://10.70.63.91:3000/api/logs/add` or a public URL if deployed).
        * Send an HTTP POST request to that API URL using a bash command (like `curl`) or a Node.js script.
        * The request body must be a JSON object with:
          - `foodName` (string)
          - `calories` (number)
          - `proteinG` (number)
          - `carbsG` (number)
          - `fatsG` (number)
        * Ensure to verify that the request succeeds (returns `{"success": true}`)."""
        
    new_content, count = re.subn(pattern, replacement, content)
    if count == 0:
        # Fallback replacement
        pattern_fallback = r"(2\.\s+\*\*Logging Food Intake:\*\*.*?)(3\.\s+\*\*Daily Summary)"
        # We'll just replace the Logging Food Intake section
        replacement_fallback = replacement + "\n\n"
        new_content, count = re.subn(pattern_fallback, lambda m: replacement_fallback + m.group(2), content, flags=re.DOTALL)
    return new_content, count

if __name__ == '__main__':
    # Update TOOLS.md
    try:
        with open('/home/parkee/.openclaw/workspace/TOOLS.md', 'r') as f:
            tools = f.read()
        tools_updated, count = update_tools(tools)
        with open('/home/parkee/.openclaw/workspace/TOOLS.md', 'w') as f:
            f.write(tools_updated)
        print(f"Updated TOOLS.md: {count} matches replaced.")
    except Exception as e:
        print(f"Error TOOLS.md: {e}")

    # Update SKILL.md
    try:
        with open('/home/parkee/.openclaw/plugin-skills/calorie-tracker/SKILL.md', 'r') as f:
            skill = f.read()
        skill_updated, count = update_skill(skill)
        with open('/home/parkee/.openclaw/plugin-skills/calorie-tracker/SKILL.md', 'w') as f:
            f.write(skill_updated)
        print(f"Updated calorie-tracker/SKILL.md: {count} matches replaced.")
    except Exception as e:
        print(f"Error SKILL.md: {e}")
