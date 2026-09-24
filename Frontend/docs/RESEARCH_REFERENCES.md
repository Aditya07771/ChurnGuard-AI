# UI/UX and Agent-Workflow Research References

This handoff is based on official documentation current at research time. It translates those references into concrete project guidance rather than prescribing a particular visual result without regard to the data.

## Antigravity conventions

- **Workspace rules:** Antigravity documents `AGENTS.md`, `GEMINI.md`, and `.agents/rules/*.md` as supported workspace-scoped rules. Use `AGENTS.md` in the frontend workspace root as the persistent instruction file. The singular `AGENT.md` in this pack is a courtesy alias because the owner requested it.  
  https://antigravity.google/docs/rules/
- **Agent skills:** Antigravity describes skills as a folder containing `SKILL.md`, with YAML frontmatter including a name and description. Workspace-specific skills live under `.agents/skills/<skill-folder>/`. The skill in this pack follows that layout.  
  https://antigravity.google/docs/skills/
- **Rules versus skills:** Rules should communicate invariants and boundaries; a skill should guide a repeatable multi-step workflow. This pack separates product constraints in `AGENTS.md` from the implementation process in `SKILL.md`.  
  https://antigravity.google/docs/rules-workflows

## Dashboard and UI components

- **shadcn/ui Sidebar:** composable/collapsible sidebar primitives and structure are useful for the dashboard application shell.  
  https://ui.shadcn.com/docs/components/aria/sidebar
- **shadcn/ui Charts:** shadcn chart components use Recharts and support accessible chart layers; the documentation notes using a defined height/min-height/aspect ratio so responsive chart containers can measure correctly.  
  https://ui.shadcn.com/docs/components/base/chart
- **shadcn Dashboard blocks:** provides a useful reference for the composition of sidebar, page header, metric cards, charts and tables. Treat as a composition reference, not as a reason to keep default styling or data.  
  https://ui.shadcn.com/blocks?category=dashboard
- **Recharts accessibility:** the Recharts accessibility layer adds chart labels/roles/keyboard interaction; arrow-key movement avoids forcing every point into the page's tab sequence.  
  https://github.com/recharts/recharts/wiki/Recharts-and-accessibility
- **Tailwind responsive design:** Tailwind documents a mobile-first breakpoint system and container-query support. Use responsive grid/layout primitives instead of fixed desktop widths.  
  https://tailwindcss.com/docs/responsive-design
- **Lucide React:** tree-shakable inline SVG icon components, customizable in size/color, with TypeScript support. Use consistent line icons and avoid emoji as interface icons.  
  https://lucide.dev/guide/react/

## Server-state and freshness

- **TanStack Query query keys:** stable serializable query keys identify unique data resources and should include relevant input parameters. Use keys for endpoint, filters and pagination rather than manual global cache fields.  
  https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
- **TanStack Query query basics:** query hooks connect asynchronous API calls to caching, error state and refetching. Use mutations for server-changing POST actions and invalidate relevant queries after success.  
  https://tanstack.com/query/latest/docs/framework/react/guides/queries

## Accessibility

- **WCAG 2.2 contrast minimum (1.4.3):** normal text needs at least 4.5:1 contrast; large text needs at least 3:1. Avoid pale grey labels on white and check actual combinations after theming.  
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- **WCAG 2.2 focus visible (2.4.7):** keyboard users need a visible focus indicator. Do not remove focus outlines without replacing them.  
  https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html

## Project-specific conclusions derived from the backend

- The project's actual FastAPI route files, schemas and service code define the API contract. The frontend must validate against `/openapi.json`, not generic examples from external tutorials.
- The Telco Customer Churn schema has customer service/billing/demographic fields but no geographic fields. A map would imply information the dataset does not contain, so this handoff explicitly forbids fake maps and directs the implementation toward a real customer risk scatter plot instead.
- The data is a static historical snapshot and does not have customer event timestamps. The frontend must not fabricate churn-over-time charts. Prediction history may use timestamps returned by its own API.
