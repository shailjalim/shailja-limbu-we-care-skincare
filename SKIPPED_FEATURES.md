# Skipped Features Log

This file tracks features intentionally postponed during development.

## 2026-04-06

### Feature Skipped
- Tiny protected backend endpoint to read/update quiz scoring config.

### Current Status
- Skipped for now.

### Why It Was Skipped
- Not required for immediate deployment.
- Quiz scoring already works with safe defaults and DB-based config fallback.

### Risk / Impact
- Score tuning in production must be done manually in MongoDB.
- Higher risk of accidental misconfiguration without API validation and role checks.

### Revisit Trigger
- Before public launch hardening, or when non-developer/admin users need to tune scoring.

### Suggested Future Implementation
1. Add protected admin-only routes for quiz scoring config.
2. Add strict validation for questionId, optionId, and score bounds.
3. Add audit fields (updatedBy, updatedAt, version history).
4. Add admin panel UI later for convenient updates.
