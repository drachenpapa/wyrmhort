FROM python:3.13-slim

WORKDIR /app

COPY ./requirements.txt /app
COPY ./secrets /secrets
COPY ./src /app
COPY ./tests /app/tests

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "uvicorn[standard]"

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
