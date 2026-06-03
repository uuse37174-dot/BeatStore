# Firestore Security Specifications & Invariants

## 1. Data Invariants
- **Resource Ownership**: Orders must remain private and accessible only by the placing user (matched via authenticated Google email) or by the verified admin (`uuse37174@gmail.com`).
- **Administrative Dominance**: Create/Update/Delete privileges on Blog Posts, Store Products, and Site Settings are strictly gated to the admin account `uuse37174@gmail.com` with a verified email check.
- **Order Uniqueness**: Duplicate transaction submissions are checked and handled securely.

## 2. The Dirty Dozen Payloads (Vulnerability Scenarios)
1. An anonymous user attempts to delete a blog post.
2. A non-admin logged-in user attempts to insert a new product.
3. An unauthenticated viewer attempts to read administrative email logs.
4. An authenticated user tries to query list of others' orders.
5. An attacker tries to write dynamic config fields to site settings documents.
6. A spoofed administrator email (without email_verified=true) attempts to update state values.
7. An attacker attempts to write an order stating they are the admin.
8. An attacker attempts to inject a junk ID key into posts.
9. A viewer tries to purge categories.
10. A user attempts to change payment settings to route routing codes to their private account.
11. A standard checkout user tries to delete an active order reference.
12. A viewer tries to append comments bypass checking.

## 3. Deployment Rules Draft
Rules are crafted in `/firestore.rules` and deployed via `deploy_firebase`.
