FROM python:3.14-slim

RUN apt-get update && apt-get upgrade -y && apt-get clean

WORKDIR /app

RUN pip install --no-cache-dir poetry==1.8.5

COPY ./pyproject.toml ./poetry.lock /app/

RUN poetry config virtualenvs.create false
RUN poetry install --only main --no-interaction --no-ansi

COPY ./secrets /secrets
COPY ./src /app

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
