---
version: 1
slug: "src-components-authpage-jsx"
primary_target: "src/components/AuthPage.jsx"
related_targets: []
---

Scope: `/login` sign-in and account registration web page.
Mode: Operate.
Audience and task: People who want to create or access an account for their personal credential vault.
Outcome and proof: Complete working registration/sign-in against MongoDB Atlas account storage. The app must never fake successful authentication. The user selected client-side encryption; vault payloads are ciphertext in MongoDB. Forgotten encryption passwords cannot recover old vault data. Existing browser-local data must not be overwritten or silently discarded.

## Direction contract

THESIS: One clear account console handles sign-in and account creation without sending users to competing pages.
OWN-WORLD: Inherit the current dark-green PASSVAULT interface: existing display/UI/data type roles, restrained green accents, familiar controls, and direct line-and-surface styling.
STORY: Choose Sign in or Create account, enter email and password, receive honest validation/API feedback, and enter the vault only after real server authentication and client-side key derivation succeed.
FIRST VIEWPORT: Existing nav above a centered account form; a distinct Sign in/Create account segmented switch; labeled email and password controls; a single primary submit action; quiet link back to the vault and About. Stack naturally on mobile.
FORM: One account console, selected from authentication surface seed `d50ffcd8`; client-encrypted vault, no plaintext storage on server, no invented recovery claims.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
