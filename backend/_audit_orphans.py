import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / '.env')
from turso_client import pipeline, rows

# Which project has NULL provider_id?
r = pipeline(["SELECT id, project_name, provider_id FROM projects WHERE provider_id IS NULL OR provider_id = '' OR provider_id = '[]'"])[0]
for row in rows(r):
    print(f'NULL provider: project {row[0]} = {row[1]} | provider_id={row[2]!r}')

# client_details with NULL project_id
r2 = pipeline(["SELECT client_id, client_name, project_id FROM client_details WHERE project_id IS NULL"])[0]
for row in rows(r2):
    print(f'NULL project_id: client_id={row[0]} name={row[1]} project_id={row[2]}')

# client_details with valid project_id
r3 = pipeline(["SELECT client_id, client_name, project_id FROM client_details WHERE project_id IS NOT NULL"])[0]
for row in rows(r3):
    print(f'linked: client_id={row[0]} name={row[1]} project_id={row[2]}')