FROM python:3.14-slim@sha256:63a4c7f612a00f92042cbdcc7cdc6a306f38485af0a200b9c89de7d9b1607d15 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.21@sha256:ff07b86af50d4d9391d9daf4ff89ce427bc544f9aae87057e69a1cc0aa369946 /uv /bin/uv

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN UV_NO_CACHE=1 UV_COMPILE_BYTECODE=1 uv sync --frozen --no-dev --no-install-project

FROM python:3.14-slim@sha256:63a4c7f612a00f92042cbdcc7cdc6a306f38485af0a200b9c89de7d9b1607d15

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY ./secrets /secrets
COPY ./src /app

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
