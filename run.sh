#!/bin/bash
set -e

python3 -m pip install --user -r backend/requirements.txt
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 9999
