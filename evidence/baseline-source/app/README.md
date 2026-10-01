# OWASP NodeGoat Runtime

This directory contains the NodeGoat application source used by the IE3142 DevSecOps project.

Use the repository root for the supported local deployment:

```bash
cp .env.example .env
docker compose up --build
```

The final runtime is the remediated version. The vulnerable source used for before/after comparison is preserved under `../evidence/baseline-source/`.

Do not deploy the vulnerable baseline to public infrastructure.
