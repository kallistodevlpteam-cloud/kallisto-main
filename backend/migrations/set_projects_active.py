"""Set some existing pr projects to active status for testing the Active tab.
"""
import sys
sys.path.insert(0, 'C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend')
from dotenv import load_dotenv
from turso_client import pipeline, rows
load_dotenv('C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend\\.env')

# Set projects 1, 5, 15 to active for testing
for pid in [1, 5, 15]:
    pipeline([
        "UPDATE projects SET project_status = 'active', updated_at = strftime('%s','now') WHERE id = ?"
    ], [[pid]])
    print(f"Updated project {pid} to status='active'")

# Verify
r = pipeline(["SELECT id, project_name, project_character, project_status FROM projects WHERE project_character = 'pr' ORDER BY id"])[0]
print("\n=== VERIFICATION ===")
for row in rows(r):
    print(f"Project {row[0]}: {row[1]} | char={row[2]} | status={row[3]}")

print("\n=== UPDATE COMPLETE ===")
