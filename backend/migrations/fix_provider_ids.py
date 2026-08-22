"""Update provider_id for enquiry projects 16-19 to include PROV-0001 for access.
"""
import sys
sys.path.insert(0, 'C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend')
from dotenv import load_dotenv
from turso_client import pipeline, rows
load_dotenv('C:\\Users\\ignat\\Downloads\\kallisto-app-backup\\backend\\.env')

# Update provider_id
for pid in [16, 17, 18, 19]:
    pipeline(["UPDATE projects SET provider_id = ? WHERE id = ?"], [[ '["PROV-0001"]', pid]])
    
# Verify
r = pipeline(["SELECT id, project_name, provider_id FROM projects WHERE id IN (16,17,18,19) ORDER BY id"])[0]
for row in rows(r):
    print(f"Project {row[0]}: {row[1]} | providers={row[2]}")

print("\nProvider IDs updated successfully")
