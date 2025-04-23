import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from api.routes import app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://wyrmhort.web.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def main():
    uvicorn.run(app, host="127.0.0.1", port=8080, reload=True)

if __name__ == "__main__":
    main()
