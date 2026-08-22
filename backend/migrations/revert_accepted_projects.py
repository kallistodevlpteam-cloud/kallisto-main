"""Revert acceptance of projects 16, 17, 18 back to enquiry status.
"""
import sys
sys.path.insert(0, 'C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend')
from dotenv import load_dotenv
from turso_client import pipeline, rows
load_dotenv('C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend\\.env')

# Revert projects 16, 17, 18 back to enquiry
for pid in [16, 17, 18]:
    pipeline([
        "UPDATE projects SET project_character = 'enq', project_status = 'upcoming', updated_at = strftime('%s','now') WHERE id = ?"
    ], [[pid]])
    
    # Reset enquiry view
    pipeline([
        "UPDATE enquiry_details SET view = 0, updated_at = strftime('%s','now') WHERE project_id = ?"
    ], [[pid]])
    
    print(f"Reverted project {pid}: character='enq', status='upcoming'")

# Verify
r = pipeline(["SELECT id, project_name, project_character, project_status FROM projects WHERE id IN (16,17,18,19) ORDER BY id"])[0]
print("\n=== VERIFICATION ===")
for row in rows(r):
    print(f"Project {row[0]}: {row[1]} | char={row[2]} | status={row[3]}")

print("\n=== REVERT COMPLETE ===")
