FROM python:3.14-slim@sha256:b877e50bd90de10af8d82c57a022fc2e0dc731c5320d762a27986facfc3355c1 AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.25@sha256:1e3808aa9023d0980e7c15b1fa7c1ac16ff35925780cf5c459858b2d693f01a9 /uv /bin/uv

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN UV_NO_CACHE=1 UV_COMPILE_BYTECODE=1 uv sync --frozen --no-dev --no-install-project

FROM python:3.14-slim@sha256:b877e50bd90de10af8d82c57a022fc2e0dc731c5320d762a27986facfc3355c1

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY ./secrets /secrets
COPY ./src /app

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
