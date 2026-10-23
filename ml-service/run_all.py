"""
Run all ML microservices simultaneously for local development.
"""
import subprocess
import sys
import time
import signal

# Define all services (module name, port, display name)
SERVICES = [
    ("app:app", 8000, "Pricing"),
    ("app_demand:app", 8001, "Demand Forecasting"),
    ("app_fraud:app", 8002, "Fraud Detection"),
    ("app_segmentation:app", 8003, "Customer Segmentation"),
    ("app_recommendation:app", 8004, "Recommendation"),
    ("app_anomaly:app", 8005, "Anomaly Detection"),
    ("app_ocr:app", 8006, "Computer Vision (OCR)")
]

processes = []

def start_services():
    print("🚀 Starting all ML Services...\n")
    for module, port, name in SERVICES:
        print(f"   [Starting] {name} on port {port}...")
        # Use sys.executable to ensure it uses the current virtual environment
        cmd = [sys.executable, "-m", "uvicorn", module, "--host", "0.0.0.0", "--port", str(port)]
        p = subprocess.Popen(cmd)
        processes.append(p)
        time.sleep(1) # Slight delay to prevent overlapping logs

    print("\n✅ All services are running! Press Ctrl+C to stop them all.")

def shutdown():
    print("\n\n🛑 Stopping all ML Services...")
    for p in processes:
        p.terminate()
    for p in processes:
        p.wait()
    print("✅ All services stopped gracefully.")

if __name__ == "__main__":
    try:
        start_services()
        # Keep the main process alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        shutdown()
