import os
import sys
import uvicorn

if __name__ == "__main__":
    # Ensure current directory is on PYTHONPATH
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    # Render supplies PORT environment variable (typically 10000)
    raw_port = os.environ.get("PORT", os.environ.get("RENDER_PORT", "10000"))
    try:
        port = int(raw_port)
    except (ValueError, TypeError):
        port = 10000

    print(f"=== ResearchOS Backend launching on 0.0.0.0:{port} ===", flush=True)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")
