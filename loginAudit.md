# Authentication and RBAC Audit
** KAN-124 not KAN-117
**Project:** Shahebbazar  
**Audit area:** User authentication, session handling and role-based access control  
**Status:** RBAC foundation in progress  
**Login method:** Awaiting client confirmation regarding OTP/SMS  
**Branch:** `ari/feature-rbac-foundation`

---

## 1. Purpose

This audit evaluates the current authentication and role-based access control implementation against the client requirement for three account roles:

- Customer
- Vendor / Business Owner
- Platform Admin

The authentication method is intentionally not being implemented yet because the team is awaiting client confirmation regarding OTP/SMS delivery and associated costs.

The current work focuses on creating the server-side session and authorization foundation that can support the final approved authentication method.

---

## 2. Current Role Model

The database already supports the required roles through the `users.user_role` field:

```text
customer
vendor
admin
```

The database restricts the field to these values using a `CHECK` constraint.

### Current database status

- Customer role exists.
- Vendor role exists.
- Admin role exists.
- Users have an active, suspended or deleted status.
- Vendors reference their owning user through `vendors.user_id`.
- A server-side `sessions` table exists.
- Session records include expiration timestamps.
- Only session-token hashes are intended to be stored.

### Current application status

Before the RBAC foundation changes:

```text
Database role model:              Present
Frontend route protection:        Placeholder only
Customer identity:                Seeded helper
Vendor identity:                  URL-derived or seeded helper
Admin identity:                   Seeded helper
Backend role enforcement:         Not established
Vendor ownership enforcement:     Inconsistent
Login page:                       Missing, returned 404
Authentication method:            Awaiting client confirmation
```

---

## 3. Protected Frontend Route Audit

The application contains three route groups intended for authenticated users:

```text
(seeker)
(provider)
(admin)
```

### Customer route group

File:

```text
frontend/shahebbazar/app/(seeker)/layout.tsx
```

The layout contains a `TODO(auth)` comment but currently returns the page content without checking a session or role.

Current behaviour:

```text
Anonymous visitor
→ enters customer URL
→ customer page renders
```

### Provider route group

File:

```text
frontend/shahebbazar/app/(provider)/layout.tsx
```

The layout contains a `TODO(auth)` comment for a vendor session and role check but currently returns the page content without enforcing either requirement.

Current behaviour:

```text
Anonymous visitor
→ enters vendor URL
→ vendor page renders
```

### Admin route group

File:

```text
frontend/shahebbazar/app/(admin)/layout.tsx
```

The layout contains a `TODO(auth)` comment for an admin session and role check, but it currently returns the page content without verifying admin access.

Current behaviour:

```text
Anonymous visitor
→ enters admin URL
→ admin page renders
```

### Important finding

The following metadata appears in the protected layouts:

```ts
robots: {
    index: false,
    follow: false
}
```

This prevents search engines from indexing the pages, but it does not provide authentication or authorization.

All three route groups currently organise pages without protecting them.

---

## 4. Simulated Customer Identity

Customer routes repeatedly call:

```js
const userId = await currentCustomerId();
```

The current helper selects the first active customer from the database:

```js
async function currentCustomerId(db = pool) {
    const result = await db.query(
        `SELECT user_id FROM users
         WHERE user_role = 'customer'
           AND user_status = 'active'
         ORDER BY user_id
         LIMIT 1`
    );

    return result.rows[0]?.user_id ?? null;
}
```

This means customer operations are performed as the first seeded customer rather than the person making the HTTP request.

### Affected functionality

- Account details
- Saved businesses
- Reviews
- Reports
- Conversations
- Messages
- Alerts

### Required replacement

The seeded helper should eventually be replaced with:

```js
const userId = req.user.user_id;
```

This replacement must only occur after `req.user` is securely resolved from a valid server-side session.

---

## 5. Simulated Admin Identity

Admin routes call:

```js
const actor = await currentAdminId(client);
```

The current helper selects the first active administrator:

```js
async function currentAdminId(db = pool) {
    const result = await db.query(
        `SELECT user_id FROM users
         WHERE user_role = 'admin'
           AND user_status = 'active'
         ORDER BY user_id
         LIMIT 1`
    );

    return result.rows[0]?.user_id ?? null;
}
```

This records a seeded administrator as the audit actor but does not prove that the HTTP caller is an administrator.

### Affected operations

- Creating categories
- Editing categories
- Resolving reports
- Hiding reviews
- Restoring reviews
- Approving or rejecting vendors
- Approving or rejecting listings
- Viewing administrative analytics

### Risk

A caller may be able to invoke an administrative endpoint directly because the endpoint does not yet validate the caller’s session and role.

---

## 6. Vendor Ownership Audit

The current vendor helper is:

```js
async function vendorOwnerId(vendorId, db = pool) {
    const result = await db.query(
        "SELECT user_id FROM vendors WHERE vendor_id = $1",
        [vendorId]
    );

    return result.rows[0]?.user_id ?? null;
}
```

This returns the owner of a business, but it does not compare the owner against the authenticated caller.

The helper currently answers:

```text
Who owns this vendor?
```

It does not answer:

```text
Does the signed-in user own this vendor?
```

### High-priority messaging issue

The vendor message route accepts caller-supplied vendor and conversation IDs:

```text
POST /api/vendors/:vendorId/conversations/:id/messages
```

Based on the audited code, the route verifies that the conversation belongs to the supplied vendor but does not yet verify that the caller owns that vendor.

A caller who knows valid vendor and conversation IDs may be able to submit a message as the vendor.

This endpoint should receive high priority when ownership middleware is introduced.

---

## 7. Vendor Owner Information Exposure

The following route loads the owning user for a caller-supplied vendor ID:

```text
GET /api/vendors/:vendorId/owner
```

The returned data includes:

```text
user_name
user_phone
user_email
```

This is private account information and should not be treated as public business-profile information.

The endpoint must eventually require:

```text
Authenticated user
AND
owning vendor account or admin role
```

---

## 8. Vendor Operations Requiring Protection

The following functionality must require authenticated vendor ownership or admin access:

- Vendor dashboard
- Listing creation
- Listing editing
- Listing deletion
- Listing photo uploads
- Listing photo deletion
- Vendor profile editing
- Logo uploads
- Logo removal
- Gallery photo uploads
- Gallery photo deletion
- Payment-method editing
- Review replies
- Vendor messages
- Vendor alerts
- Social-link editing
- Owner account settings

Knowing a `vendorId` must never be sufficient to modify the associated business.

The required authorization chain is:

```text
Authenticated user
→ active account
→ vendor or admin role
→ ownership of requested vendor
→ operation permitted
```

---

## 9. Admin Operations Requiring Protection

The following operations must require the `admin` role:

- Vendor approval and rejection
- Listing approval and rejection
- Category creation
- Category editing
- Report resolution
- Review hiding
- Review restoration
- Administrative analytics
- NID verification decisions

The backend must enforce these permissions even if the frontend admin interface is hidden.

---

## 10. Proposed Access Matrix

| Area | Anonymous | Customer | Vendor | Admin |
|---|---:|---:|---:|---:|
| Public browsing | Yes | Yes | Yes | Yes |
| Vendor registration | Yes | Yes | Yes | Yes |
| Customer account | No | Yes | Yes | Yes |
| Saved businesses | No | Yes | Yes | Yes |
| Customer reviews | No | Yes | Yes | Yes |
| Customer messaging | No | Yes | Yes | Yes |
| Vendor dashboard | No | No | Yes | Yes |
| Vendor listing management | No | No | Owning vendor | Yes |
| Vendor profile management | No | No | Owning vendor | Yes |
| Vendor message responses | No | No | Owning vendor | Yes |
| Admin portal | No | No | No | Yes |
| Moderation decisions | No | No | No | Yes |
| Administrative analytics | No | No | No | Yes |

This matrix may require final confirmation from the team, particularly regarding whether vendor and admin users can also use customer-facing account features.

---

## 11. Session Schema

The database already contains a server-side `sessions` table with:

```text
session_id
user_id
session_token_hash
session_expires_at
session_user_agent
session_ip
session_created_at
```

The session token is designed to be stored as a hash rather than plaintext.

The session table can support an eventual login method based on:

- OTP/SMS
- Phone number and password
- Another client-approved authentication method

The login method determines how a session is created.

The RBAC foundation determines what an existing valid session may access.

---

## 12. RBAC Foundation Implemented

The following file has been created:

```text
backend/lib/middleware/auth.js
```

### Session-token hashing

The middleware uses SHA-256 to hash the opaque session token before querying the database:

```js
function hashSessionToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}
```

This allows the database to store only:

```text
session_token_hash
```

rather than the original session token.

### Cookie parsing

The middleware reads the session token from:

```text
shaheb_session
```

The session token is not read from:

- URL parameters
- Request-body role fields
- Local storage
- Caller-supplied user IDs

### Session resolution

The `resolveSession` middleware:

1. Reads the session cookie.
2. Hashes the token.
3. Searches for a matching session.
4. Rejects expired sessions.
5. Rejects inactive users.
6. Loads safe user-account information.
7. Assigns the resolved identity to `req.user`.
8. Assigns safe session metadata to `req.session`.

The resolved user contract is:

```js
req.user = {
    user_id,
    user_name,
    user_phone,
    user_email,
    user_role
};
```

### Authentication middleware

The following reusable middleware has been implemented:

```js
requireAuthenticatedUser
```

Behaviour:

```text
No valid session → 401 Authentication required
Valid session → request continues
```

### Role middleware

The following reusable middleware has been implemented:

```js
requireRole(...allowedRoles)
```

Expected behaviour:

```text
No valid session → 401
Valid session with wrong role → 403
Valid session with allowed role → request continues
```

### Vendor-ownership middleware

The following reusable middleware has been implemented:

```js
requireVendorOwnership
```

Expected behaviour:

```text
No valid session → 401
Customer account → 403
Vendor accessing another vendor → 403
Owning vendor → request continues
Admin → request continues
```

The middleware does not trust a role or owner ID supplied by the browser.

---

## 13. Global Session Resolution

The backend now runs:

```js
app.use(resolveSession);
```

before API route registration.

This gives later routes access to:

```js
req.user
req.session
```

when a valid session cookie exists.

Public requests without a session are still allowed to reach public endpoints.

The middleware does not automatically block anonymous requests. Individual protected routes must use:

```js
requireAuthenticatedUser
```

or:

```js
requireRole(...)
```

as appropriate.

---

## 14. Protected Identity Endpoint

The following endpoint has been added:

```text
GET /api/auth/me
```

The endpoint uses:

```js
requireAuthenticatedUser
```

Successful responses will return safe account information only:

```json
{
  "authenticated": true,
  "user": {
    "user_id": 57,
    "user_name": "Example User",
    "user_phone": "+8801700000000",
    "user_email": null,
    "user_role": "vendor"
  }
}
```

The endpoint does not return:

- Session-token hashes
- Password hashes
- OTP hashes
- Submitted NID references
- Internal moderation data
- Rejection reasons

---

## 15. Completed Test

### Anonymous session test

Request:

```text
GET /api/auth/me
```

Result:

```json
{
  "success": false,
  "error": "Authentication required"
}
```

HTTP status:

```text
401 Unauthorized
```

### Result interpretation

This confirms:

- The API starts successfully.
- The session resolver runs without crashing.
- Anonymous requests do not receive a simulated customer.
- `req.user` remains empty when no valid session cookie exists.
- The protected identity endpoint rejects unauthenticated access.
- The first RBAC foundation test has passed.

---

## 16. Current Progress

```text
Database role model:                 Complete
Session table:                       Present
Session-token hashing:               Implemented
Session-cookie parsing:              Implemented
Session lookup:                      Implemented
Expired-session rejection:           Implemented
Inactive-user rejection:             Implemented
Safe req.user contract:              Implemented
Authenticated-user middleware:       Implemented
Role middleware:                     Implemented
Vendor-ownership middleware:         Implemented
Anonymous 401 test:                  Passed
Valid-session resolution test:       Pending
Customer role test:                  Pending
Vendor role test:                    Pending
Admin role test:                     Pending
Vendor cross-ownership test:         Pending
Customer routes migrated:            Not started
Vendor routes migrated:              Not started
Admin routes migrated:               Not started
Frontend layouts protected:          Not started
Login page:                          Not started
Session creation:                    Awaiting login-method decision
OTP/SMS implementation:              Awaiting client confirmation
```

---

## 17. Deferred Decisions

The project team is awaiting client confirmation regarding the final authentication method.

No assumption has been made that Phase 1 will use:

- OTP/SMS
- Phone number and password
- Email and password
- Another identity provider

The current RBAC foundation is deliberately independent of the login method.

The following functionality is therefore deferred:

- OTP generation
- SMS-provider integration
- Password collection
- Password hashing
- Login endpoint
- Session creation endpoint
- Account registration decision
- Password recovery
- Phone-number recovery

---

## 18. Next Test Stage

Before protecting existing application routes, the next stage should create controlled development sessions for seeded accounts.

Required tests:

### Session tests

- Valid customer session resolves the customer account.
- Valid vendor session resolves the vendor account.
- Valid admin session resolves the admin account.
- Invalid session token returns `401`.
- Expired session returns `401`.
- Suspended user session returns `401`.

### Role tests

- Customer can access a customer test endpoint.
- Customer receives `403` from a vendor test endpoint.
- Customer receives `403` from an admin test endpoint.
- Vendor can access a vendor test endpoint.
- Vendor receives `403` from an admin test endpoint.
- Admin can access an admin test endpoint.

### Ownership tests

- Vendor A can access Vendor A’s protected resource.
- Vendor A cannot access Vendor B’s protected resource.
- Vendor B cannot access Vendor A’s protected resource.
- Admin can access either vendor resource if admin override remains part of the policy.

---

## 19. Migration Plan

Existing routes must be migrated gradually rather than all at once.

### Customer routes

Replace:

```js
const userId = await currentCustomerId();
```

with:

```js
const userId = req.user.user_id;
```

Only after applying:

```js
requireAuthenticatedUser
```

### Admin routes

Replace:

```js
const actor = await currentAdminId(client);
```

with:

```js
const actor = req.user.user_id;
```

Only after applying:

```js
requireRole("admin")
```

### Vendor routes

Replace implicit URL-based access with:

```js
requireAuthenticatedUser
requireVendorOwnership
```

The route should then operate on the verified:

```js
req.vendor.vendor_id
```

rather than trusting the ownership implied by the URL.

---

## 20. High-Priority Routes

The following routes should receive priority during migration:

1. Vendor conversation replies
2. Vendor owner-account details
3. Vendor listing creation and editing
4. Vendor listing deletion
5. Vendor photo uploads and deletion
6. Vendor profile editing
7. Vendor payment methods
8. Vendor review replies
9. Admin moderation decisions
10. Admin reports and review controls
11. Customer messages and alerts
12. Customer saved businesses and reviews

These routes either mutate private data, expose private account information, or perform privileged moderation actions.

---

## 21. Definition of Done

The RBAC foundation will be considered complete when:

- Only `customer`, `vendor`, and `admin` roles are permitted.
- Anonymous private requests return `401`.
- Authenticated users with insufficient roles receive `403`.
- Customer routes use the authenticated customer identity.
- Vendor routes confirm vendor role and business ownership.
- Admin routes require the admin role.
- Private routes do not use seeded identities.
- Private routes do not trust user or role information supplied by the browser.
- Vendor A cannot modify Vendor B.
- Frontend route groups enforce the same access policy as the backend.
- Backend protection remains authoritative when frontend checks are bypassed.
- Login-method selection is documented separately.
- All role and ownership tests pass.

---

## 22. Files Changed So Far

```text
backend/lib/middleware/auth.js
backend/index.js
loginAudit.md
```

No existing customer, vendor, admin or moderation routes have been protected yet.

No login mechanism has been implemented.

No authentication secrets or real identity information have been committed.



## Client Authentication Decision

The client confirmed that live SMS delivery is deferred for Phase 1 due
to provider costs.

The project should continue using phone numbers as the primary account
identifier and implement a mock verification-delivery mechanism.

The mock replaces SMS delivery only. The following parts should remain
real:

- Verification-code generation
- Verification-code hashing
- Expiration handling
- Attempt limits
- Code consumption
- Phone verification timestamps
- Server-side session creation
- Session-cookie handling
- Role-based access control

The mock verification code must be available only in the local backend
terminal and must not be exposed in production responses.

### Mock verification request testing

The `POST /api/auth/request-verification` endpoint was tested after
merging the latest changes from `main`.

Confirmed:

- A valid phone number and purpose return a successful response.
- Common Bangladesh phone-number input is normalised.
- A secure six-digit mock verification code is generated.
- The raw code appears only in the local API terminal.
- The API response does not expose the raw code.
- PostgreSQL stores only the HMAC-SHA256 code hash.
- Verification records include a five-minute expiry.
- Attempt count starts at zero.
- The consumed timestamp starts as null.
- Invalid phone input returns HTTP 400.
- Invalid verification purpose returns HTTP 400.
- The fourth matching request within the configured window returns HTTP 429.
- API health remains operational.
- Anonymous `GET /api/auth/me` continues to return HTTP 401.

No user was authenticated and no session was created during this
implementation slice.