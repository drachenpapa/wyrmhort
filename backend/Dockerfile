FROM python@sha256:b0aed0e0059e9b1527ef57689a7206f32526627b0713e2228a916df62880188a AS builder

COPY --from=ghcr.io/astral-sh/uv@sha256:88bc6eb1ccd4b82efd0e1b530caffabddf50dc2bf612e66c14ea25b8ee8a4d3d /uv /bin/uv

WORKDIR /app

COPY ./pyproject.toml ./uv.lock /app/

RUN UV_NO_CACHE=1 UV_COMPILE_BYTECODE=1 uv sync --frozen --no-dev --no-install-project

FROM python@sha256:b0aed0e0059e9b1527ef57689a7206f32526627b0713e2228a916df62880188a

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
