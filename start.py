#!/usr/bin/env python3
"""
Startup script for Tour Guide Manager
Runs both Python FastAPI backend and React frontend
"""
import os
import subprocess
import sys
import time
import threading

def start_backend():
    """Start the Python FastAPI backend"""
    print("Starting Python FastAPI backend...")
    subprocess.run([sys.executable, os.path.join('backend', 'main_firestore.py')])

def start_frontend():
    """Start the React frontend development server"""
    print("Starting React frontend...")
    time.sleep(2)  # Give backend time to start
    subprocess.run('npm run dev', cwd='frontend', shell=True)   

if __name__ == "__main__":
    backend_thread = threading.Thread(target=start_backend)
    backend_thread.daemon = True
    backend_thread.start()

    start_frontend()
