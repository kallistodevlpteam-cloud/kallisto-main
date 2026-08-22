import sys
from pathlib import Path
script_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(script_dir))
from dotenv import load_dotenv
load_dotenv(script_dir / ".env")
from turso_client import pipeline, rows

tables = [
    "project_clients", "project_lifestyle", "project_approval_process",
    "project_communication", "project_technical", "project_regulatory",
    "project_outdoor", "project_spaces", "project_timeline"
]

for tbl in tables:
    print(f"\n=== {tbl} ===")
    r = pipeline([f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{tbl}'"])[0]
    for row in rows(r):
        print(row[0])
    r2 = pipeline([f"PRAGMA table_info({tbl})"])[0]
    print("Columns:")
    for row in rows(r2):
        print(f"  {row[1]} {row[2]} notnull={row[3]} default={row[4]} pk={row[5]}")
