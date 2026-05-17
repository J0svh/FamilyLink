# Skills Integration — FamilyLink

## Skills disponibles

Los skills de desarrollo están en `~/.config/opencode/skills/` y deben aplicarse según el contexto:

| Skill | Cuándo aplicar | Agentes que lo usan |
|-------|---------------|---------------------|
| `typescript` | Todo código TypeScript (backend y frontend) | builder, validator, tester |
| `react-19` | Componentes React del frontend | builder, validator |
| `tailwind-4` | Estilos CSS del frontend | builder, validator |
| `zod-4` | Validaciones de schema (DTOs, env, payloads) | builder, validator |
| `playwright` | Tests E2E | tester |
| `nextjs-15` | Solo si se migra a Next.js (no aplica actualmente) | — |
| `pytest` | Solo si hay código Python (no aplica actualmente) | — |
| `angular` | Solo si se usa Angular (no aplica actualmente) | — |

## Skills relevantes para FamilyLink

Para este proyecto, los skills activos son:
- **typescript** — siempre (todo el código es TypeScript)
- **zod-4** — en validaciones de DTOs y variables de entorno
- **react-19** — en todo el frontend
- **tailwind-4** — en estilos del frontend
- **playwright** — en tests E2E

## Regla de aplicación automática

Cuando se planifica una tarea con `@plan-with-team`, el team-lead debe:
1. Identificar qué skills aplican según los archivos involucrados
2. Incluir sección "## Skills a aplicar" en el plan
3. Indicar a cada agente qué skill cargar
