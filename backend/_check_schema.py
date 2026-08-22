import sys
from pathlib import Path
script_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(script_dir))
from dotenv import load_dotenv
load_dotenv(script_dir / ".env")
from turso_client import pipeline, rows

r = pipeline(["PRAGMA table_info(project_clients)"])[0]
for row in rows(r):
    print(row)

print("---")
r2 = pipeline(["PRAGMA table_info(project_lifestyle)"])[0]
for row in rows(r2):
    print(row)

print("---")
r3 = pipeline(["PRAGMA table_info(project_spaces)"])[0]
for row in rows(r3):
    print(row)