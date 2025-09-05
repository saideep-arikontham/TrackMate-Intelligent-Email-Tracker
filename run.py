# in run.py (at the project root)

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="localhost", port=5050, debug=True)