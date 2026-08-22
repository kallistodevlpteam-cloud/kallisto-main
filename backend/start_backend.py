import os, sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
os.environ['FLASK_APP'] = 'app.py'

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))

from app import app
app.run(host='127.0.0.1', port=8000, debug=False)
