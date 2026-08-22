import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
from turso_client import pipeline, rows

# Check tables
result = pipeline(["SELECT name FROM sqlite_master WHERE type='table'"])[0]
tables = [row[0] for row in rows(result)]
for t in ['project_proposals', 'project_team_members', 'project_messages', 'projects']:
    print(f'{t}: {"EXISTS" if t in tables else "MISSING"}')

# Check project_status column
cols = pipeline(["PRAGMA table_info(projects)"])[0]
col_names = [c[1] for c in rows(cols)]
print(f'project_status column: {"EXISTS" if "project_status" in col_names else "MISSING"}')
print(f'project_character column: {"EXISTS" if "project_character" in col_names else "MISSING"}')

# Check current values
for r in rows(pipeline(["SELECT id, project_name, project_character, project_status FROM projects LIMIT 3"])[0]):
    print(f'project {r[0]}: char={r[2]}, status={r[3]}, name={r[1]}')
