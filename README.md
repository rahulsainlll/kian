# kian

> Switch's examples are engineering teams fixing incidents. **Kian is a sales team closing deals.**

Kian is a sales desk that lives in team chat (Switch rooms), plus a Wispr-Flow-style desktop widget that lets you
talk to it and taps you when a room needs you. Agents draft, people send.

## Run the prototype

```bash
pnpm install
pnpm dev          # http://localhost:5173  ·  /components for the component gallery
```

## Layout

| Path | What |
|---|---|
| `packages/ui` | `@kian/ui`: the widget components, shared by the website and the desktop app |
| `apps/web` | The kian site: live demo of the morning brief, and `/components` |
| `docs/` | [Research](docs/01-research.md) · [Design](docs/02-design.md) · [Architecture](docs/03-architecture.md) |

Design references applied: emil-design-eng skills (motion), stageshow (framing and craft), skullet (loading
skeletons), Hairline (figures).
