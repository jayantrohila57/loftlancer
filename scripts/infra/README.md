# Infra orchestration (`pnpm infra-up` / `infra-down`)

Uses the same `docker-compose.yml` files under `infra/`; only the CLI changes (**Podman** by default).

## Runtime

| File                                         | Purpose                                |
| -------------------------------------------- | -------------------------------------- |
| [runtime.env](./runtime.env)                 | `CONTAINER_RUNTIME=podman` or `docker` |
| [runtime.env.example](./runtime.env.example) | Template                               |

## Podman (Linux, rootless)

Enable the user socket once:

```bash
systemctl --user enable --now podman.socket
podman info   # should succeed
```

`podman compose` may delegate to a `docker-compose` plugin; stacks still run on Podman.

## Commands

```bash
pnpm infra-up       # postgres → create `autumn` DB → redis → autumn
LOFTLANCER_INFRA_BUILD=1 pnpm infra-up   # first time / after upstream changes (slow)
pnpm infra-status   # containers + ports 4001–4004
pnpm infra-down     # stop all three stacks (volumes kept)
```

Ports: [infra/ports.md](../../infra/ports.md).
