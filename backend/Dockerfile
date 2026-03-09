FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apt-get update && apt-get upgrade -y && apt-get clean

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN uv sync --frozen --no-dev

COPY ./secrets /secrets
COPY ./src /app

EXPOSE 8080

CMD ["uv", "run", "uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
