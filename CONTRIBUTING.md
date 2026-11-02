# Contributing to loftlancer

Thanks for your interest in contributing!

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies and follow the setup steps in the [README](README.md).
3. Base your work on **`dev`**, not **`main`**: `git checkout dev && git pull --rebase`.
4. Create a branch for your change: `git checkout -b feat/short-description`.

## Branch policy

**Do not commit or push directly to `main`.** That applies to everyone — including small fixes and documentation-only changes.

1. Merge your branch into **`dev`** first (pull request or merge on GitHub).
2. Production updates go to **`main`** only by merging **`dev` → `main`** (see [docs/releasing.md](docs/releasing.md)).

Enable GitHub **branch protection** on `main` (block direct pushes; require PR from `dev` or release automation) so the rule is enforced on the server, not only in docs.

## Making changes

- Keep pull requests focused on a single change.
- Follow the existing code style and run the project's lint/type-check/test scripts (see `package.json`) before opening a PR.
- After `pnpm install`, Husky runs a **pre-commit** hook (`lint-staged` + Biome on staged files). CI runs the full gate (`lint:ci`, types, tests, build). Do not use `--no-verify` unless you have a documented reason.
- Never commit secrets or real `.env` files; use `.env.example` as a reference.

## Reporting bugs and requesting features

Use the issue templates on GitHub. For security issues, see [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
