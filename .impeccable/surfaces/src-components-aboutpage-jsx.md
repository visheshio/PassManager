---
version: 1
slug: "src-components-aboutpage-jsx"
primary_target: "src/components/AboutPage.jsx"
related_targets: []
---

Scope: `/about` informational web page.
Mode: Read.
Audience and task: People deciding whether PASSVAULT's existing credential workflow fits their needs.
Outcome and proof: Explain actual add, search, reveal, copy, edit, delete, and ten-at-a-time pagination behavior. Explain that vault entries are client-encrypted before account-backed MongoDB storage. Do not claim certification, cloud sync beyond the selected account vault, or guaranteed recovery.

## Direction contract

THESIS: Explain the real credential workflow as a short sequence instead of a generic benefits-card wall.
OWN-WORLD: Inherit the current dark-green PASSVAULT interface, display/UI/data type roles, restrained accent color, and consistent controls.
STORY: Understand how a credential is added, found later, and managed; understand that account vault payloads are encrypted in the browser and that a forgotten encryption password cannot recover them.
FIRST VIEWPORT: Existing nav, a direct About heading, and the first step of the credential workflow; continue with search/management steps and a concise account-storage note. Keep the sequence readable on mobile.
FORM: Credential workflow, selected from About surface seed `99f8af21`; use only implemented capability facts, no invented testimonial or security proof.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
