FROM python:3.14-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.7 /uv /bin/uv

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN UV_NO_CACHE=1 UV_COMPILE_BYTECODE=1 uv sync --frozen --no-dev --no-install-project

FROM python:3.14-slim

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY ./secrets /secrets
COPY ./src /app

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
