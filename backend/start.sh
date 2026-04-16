#!/bin/bash
echo "=== Python version ==="
python --version
echo "=== Testing imports ==="
python healthcheck.py
echo "=== Starting uvicorn ==="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}
