import uvicorn
from dotenv import load_dotenv

from api.routes import app

load_dotenv()


def main():
    uvicorn.run(app, host="127.0.0.1", port=8080, reload=True)


if __name__ == "__main__":
    main()
