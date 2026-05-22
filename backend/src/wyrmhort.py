import os

import uvicorn
from dotenv import load_dotenv

from api.routes import app


def main() -> None:
    load_dotenv()
    dev_mode = os.environ.get("APP_ENV", "production").lower() == "development"
    uvicorn.run(app, host="127.0.0.1", port=8080, reload=dev_mode)


if __name__ == "__main__":
    main()
