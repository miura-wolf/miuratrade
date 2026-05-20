---
name: Doc-driven implementation approach
description: User wants all implementation plans based on strategy-turtle-miura.md and webs.md docs — not generic feature roadmaps
type: feedback
---

All implementation plans must be grounded in the actual docs — specifically `strategy-turtle-miura.md` and `webs.md`.

**Why:** User explicitly corrected me when I proposed a generic 7-layer feature roadmap. They said "ya se te olvido lo que hablamos acerca de las implementaciones basadas en el md de la estrategia miura y el md de las webs." The strategy doc defines HOW indicators and signals should work (not just WHAT exists), and webs.md defines WHAT libraries to use (not just what's installed).

**How to apply:** Before proposing any plan or sprint, re-read `strategy-turtle-miura.md` and `webs.md`. The plan should reference specific sections of these docs. Don't invent features — implement what the docs describe. If a doc mentions a specific approach (e.g., "oakscriptJS indicator() for creating indicators"), that IS the implementation approach — don't substitute with generic JS functions.
