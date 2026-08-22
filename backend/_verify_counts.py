import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
from turso_client import pipeline, rows

for table in ["project_clients","project_lifestyle","project_approval_process","project_communication","project_technical","project_regulatory","project_outdoor","project_spaces","project_timeline"]:
    count = rows(pipeline([f"SELECT count(*) FROM {table}"])[0])[0][0]
    print(f"{table}: {count} rows")
