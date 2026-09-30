FROM python@sha256:be8ccd085666c34273c9dc5607c9842f8b2e3116128aae45148ce164c07ce09d AS builder

COPY --from=ghcr.io/astral-sh/uv@sha256:a7aed3216253ee804de3e2d8afa5073baa1a177335345d43845cd4165e43b711 /uv /bin/uv

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN UV_NO_CACHE=1 UV_COMPILE_BYTECODE=1 uv sync --frozen --no-dev --no-install-project

FROM python@sha256:be8ccd085666c34273c9dc5607c9842f8b2e3116128aae45148ce164c07ce09d

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY ./src /app

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

RUN useradd --no-create-home --system appuser
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

EXPOSE 8080

CMD ["uvicorn", "api.routes:app", "--host", "0.0.0.0", "--port", "8080"]
