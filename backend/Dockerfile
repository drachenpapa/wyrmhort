FROM python:3.13-slim-bookworm

RUN apt-get update && apt-get upgrade -y && apt-get install -y build-essential && apt-get clean

WORKDIR /app

COPY ./requirements.txt /app
COPY ./secrets /secrets
COPY ./src /app
COPY ./tests /app/tests

RUN pip install --no-cache-dir -r requirements.txt "uvicorn[standard]"

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
