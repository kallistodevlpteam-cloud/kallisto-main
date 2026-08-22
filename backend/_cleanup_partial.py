import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
from turso_client import pipeline, rows

# Clean up partial inserts from failed run
for pid in [8, 9, 10, 11]:
    pipeline([f"DELETE FROM project_spaces WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_timeline WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_outdoor WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_regulatory WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_technical WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_communication WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_approval_process WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_lifestyle WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_clients WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM requirement_items WHERE requirement_id IN (SELECT id FROM requirements WHERE project_id = {pid})"])
    pipeline([f"DELETE FROM requirements WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM family_details WHERE client_id IN (SELECT client_id FROM client_details WHERE project_id = {pid})"])
    pipeline([f"DELETE FROM client_details WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_site WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_budget WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM enquiry_details WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM inspiration_img WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_proposals WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_team_members WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM project_messages WHERE project_id = {pid}"])
    pipeline([f"DELETE FROM projects WHERE id = {pid}"])
    print(f"Cleaned project {pid}")

print("Cleanup complete")
