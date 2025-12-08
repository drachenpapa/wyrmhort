FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get upgrade -y && apt-get clean

RUN pip install --no-cache-dir poetry==1.8.5

COPY ./pyproject.toml ./poetry.lock* /app/

RUN poetry config virtualenvs.create false

RUN poetry install --only main --no-interaction --no-ansi

COPY ./src /app/
COPY ./secrets /secrets

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "wyrmhort:app", "--host", "0.0.0.0", "--port", "8000"]
