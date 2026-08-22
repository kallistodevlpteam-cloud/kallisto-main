"""Accept the first 3 enquiry projects (16, 17, 18) for testing.
Updates project_character from 'enq' to 'pr' and sets status to 'active'.
"""
import sys
sys.path.insert(0, 'C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend')
from dotenv import load_dotenv
from turso_client import pipeline, rows
load_dotenv('C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend\\.env')

# Accept projects 16, 17, 18
for pid in [16, 17, 18]:
    # Update project character and status
    pipeline([
        "UPDATE projects SET project_character = 'pr', project_status = 'active', updated_at = strftime('%s','now') WHERE id = ?"
    ], [[pid]])
    
    # Mark enquiry as viewed
    pipeline([
        "UPDATE enquiry_details SET view = 1, updated_at = strftime('%s','now') WHERE project_id = ?"
    ], [[pid]])
    
    # Add acceptance message
    pipeline([
        """INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content, created_at) 
           VALUES (?, 'system', 'system', 'general', ?, strftime('%s','now'))"""
    ], [[pid, f"Project {pid} accepted by provider SP-0001 for review and proposal preparation."]])
    
    print(f"Accepted project {pid}: character='pr', status='active'")

# Verify
r = pipeline(["SELECT id, project_name, project_character, project_status FROM projects WHERE id IN (16,17,18,19) ORDER BY id"])[0]
print("\n=== VERIFICATION ===")
for row in rows(r):
    print(f"Project {row[0]}: {row[1]} | char={row[2]} | status={row[3]}")

print("\n=== ACCEPTANCE COMPLETE ===")
