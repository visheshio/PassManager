# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want to organize website login credentials for personal use.

## Product Purpose

Help users save and manage website addresses, usernames, and passwords.

## Positioning

No unique market position has been established. Keep claims grounded in the working interface and implemented storage behavior.

## Operating Context

Users enter credentials, search their saved entries, reveal or copy values, edit or delete records, and navigate a paginated list. The current app stores entries in browser `localStorage`. The requested account-backed version will use MongoDB Atlas.

## Capabilities and Constraints

Current frontend supports credential add/update, per-row reveal, copy, edit, delete, case-insensitive search across site/username/password, and pagination of ten records per page. The user approved real account registration/sign-in backed by MongoDB Atlas and moving vault records to account-backed server storage. The user selected client-side encryption; vault data must be encrypted before it is sent to MongoDB. Account passwords must not be stored in plaintext. Forgotten encryption passwords cannot recover existing vault contents. MongoDB configuration must be supplied through the local backend environment; do not request secrets through chat.

## Brand Commitments

The user requested a dark, screen-friendly interface and a professional, energetic presentation. Existing dark green surfaces and display/UI/data typography roles are incumbent visual authority.

## Evidence on Hand

The current React credential manager, its localStorage implementation, and search/pagination/reveal controls are in the repository. The Express backend currently has no authentication or database endpoints. No security certification, external audit, or recovery service is evidenced and none should be claimed.

## Product Principles

- Make credential management straightforward to scan and operate.
- Be explicit about where account and vault data are stored.
- Do not expose vault plaintext to the server or claim security certification.
- Do not discard existing browser-saved credentials during account migration.
