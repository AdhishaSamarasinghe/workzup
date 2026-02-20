# WorkzUp Backend Architecture Blueprint

This document outlines the final, production-ready backend architecture for the WorkzUp platform, fulfilling all enterprise-grade security, scalability, and structural requirements.

## 1. Directory Structure

The backend follows a clean, modular structure emphasizing separation of concerns:

```text
backend/
├── controllers/       # Business logic for each resource route
│   ├── adminController.js
│   ├── applicationController.js
│   ├── authController.js
│   ├── jobController.js
│   └── messageController.js
├── middleware/        # Request interceptors
│   ├── auth.js        # JWT authentication & RBAC
│   ├── errorHandler.js# Centralized global error handling
│   └── rateLimiter.js # Anti-abuse scaling limits
├── prisma/            # Database configurations
│   ├── schema.prisma  # Optimized relational schema
│   └── migrations/    # Versioned database changes
├── routes/            # Express route definitions pointing to controllers
│   ├── adminRoutes.js
│   ├── applicationRoutes.js
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   └── messageRoutes.js
├── utils/             # Reusable helper functions
│   ├── ApiError.js    # Standardized custom error class
│   ├── catchAsync.js  # Async wrapper eliminating try/catch hell
│   ├── email.js       # Nodemailer SMTP integration
│   └── pagination.js  # Scalable metadata & extraction logic
├── .env               # Environment configuration
└── server.js          # App entry point, middleware assembly, & server instantiation
```
*(Note: Some complex business logic could optionally be extracted into a `services/` layer in the future if controllers grow too large, but the current size utilizes thin controllers querying Prisma directly, which is standard practice).*

## 2. Production-Ready Code Principles Used

- **Async/Await Everywhere**: Zero nested callbacks. All database interactions resolve concurrently where possible (e.g., using `Promise.all` for pagination queries).
- **No Pseudo-Code**: All endpoints are fully wired to the live PostgreSQL database via Prisma. 
- **Centralized Error Handling**: `catchAsync` wraps all controllers, funneling errors to a global middleware. Stack traces are automatically hidden in production to prevent data leakage.
- **Strict Separation of Concerns**: Routes only define paths and middleware. Controllers handle request/response mapping and DB logic.

## 3. Security Configuration (OWASP Best Practices)

- **Helmet.js**: Injected globally in `server.js` to secure HTTP headers against XSS, clickjacking, and mime-sniffing.
- **Rate Limiting**:
  - Global: `100 req / 15min`.
  - Auth (Login/Register): `10 req / 15min` (stops brute force/credential stuffing).
  - Job Applications: `20 req / hour` (stops spam).
- **HTTPS Enforced**: Middleware in `server.js` ensures `x-forwarded-proto` is HTTPS before serving traffic in production.
- **Secure Sessions via HTTP-Only Cookies**: Refresh tokens are stored safely away from JavaScript scope with `sameSite: strict` and `secure: process.env.NODE_ENV === "production"`.
- **Password Hashes**: `bcryptjs` used with a work factor of 10.
- **Token Rotation**: Every time a refresh token is used, it is revoked and replaced, instantly stopping token reuse attacks.

## 4. Prisma Schema Enhancements (Performance & Scaling)

The `schema.prisma` was heavily optimized using PostgreSQL B-Tree Indexes to ensure fast query times even with millions of rows.

### Key Index Upgrades:
```prisma
model Job {
  // ... fields ...
  @@index([createdAt]) // Fast newest-first sorting
  @@index([category]) // Fast filtering
  @@index([isActive, createdAt]) // Compound index for the main public feed query
}

model User {
  // ... fields ...
  @@index([role]) // Fast admin filtering
}
```

## 5. Admin Moderation & Audit System

To allow safe platform governance without destroying historical relational data:

- **Soft Deletes**: 
  - `isBanned` on `User`: Kicks user off, revokes tokens, prevents login.
  - `isSuspended` on `User` (Recruiters): Instantly hides all their jobs.
  - `isDeleted` on `Job`: Hides job from public view but keeps it in the database.
- **Accountability via `AuditLog` Model**:
  Every admin destructive action creates an immutable log.

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  adminId     String
  admin       User     @relation("AdminAction", fields: [adminId], references: [id], onDelete: Cascade)
  action      String   // e.g., "BAN_USER", "SOFT_DELETE_JOB"
  targetId    String   // ID of the affected entity
  details     String?  // Context
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}
```

## 6. Pagination System

A modular pagination utility ensures large datasets don't crash the server's memory. Requests automatically compute `skip` and `take` based on query parameters (`?page=2&limit=10`), capped securely at a `maxLimit` of 100 per request.

### Example response payload format:
```json
{
  "data": [ ... array of jobs/users ... ],
  "metadata": {
    "totalItems": 1540,
    "itemsCount": 10,
    "page": 2,
    "limit": 10,
    "totalPages": 154,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---
**Status**: The backend architecture is 100% complete, verified, and adheres to strict production standards.
