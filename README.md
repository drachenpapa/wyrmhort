<h1 align="center">Wyrmhort</h1>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Snyk-monitored-4C4A73?logo=snyk&style=flat-square" alt="Snyk">
  <img src="https://img.shields.io/badge/Renovate-enabled-brightgreen?logo=renovate&style=flat-square" alt="Renovate">
</p>

Wyrmhort is a personal hobby expense tracker designed to help me manage and monitor my spending across various hobbies.

**Important:** This is a personal project and is not intended for public use. The only accepted user accounts are mine,
and the application is not designed to be scalable or secure for public use.

## Tech Stack

### Backend

- **Language**: Python
- **Framework**: FastAPI + Uvicorn + Pydantic
- **Platform**: Google Cloud (Cloud Run, Firebase Authentication, Firestore)
- **Testing & QA**: pytest + flake8 + mypy

### Frontend

- **Language**: TypeScript
- **Framework**: React + Vite
- **Platform**: Google Cloud (Firebase Authentication, Firebase Hosting)
- **Testing & QA**: ESLint + Vitest

### Tooling & Automation

- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Dependency Management**: Renovate
- **Security**: Snyk

## License

Wyrmhort is licensed under the [MIT License](LICENSE).

[//]: # (```bash)
[//]: # (uvicorn src.api.routes:app --reload)
[//]: # (docker compose up --build)
[//]: # (```)
