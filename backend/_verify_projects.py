import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
from turso_client import pipeline, rows

print("All projects:")
for r in rows(pipeline(["SELECT id, project_name, project_character, project_status, provider_id FROM projects"])[0]):
    print(f"  {r[0]}: char={r[2]}, status={r[3]}, providers={r[4]}, name={r[1]}")

print()
print("Provider logins:")
for r in rows(pipeline(["SELECT sp_id, email FROM provider_auth"])[0]):
    print(f"  {r[0]}: {r[1]}")
