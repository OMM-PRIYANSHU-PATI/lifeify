# Feature 021: Daily Progress

## Metadata

| Field | Value |
| --- | --- |
| Feature Number | 21 |
| Version | V1 |
| Category | Dashboard |
| Feature Key | `daily_progress` |

## Purpose

Daily Progress gives the user an at-a-glance view of current health status, progress, and missing actions.

## User Experience

The user reaches this feature from the relevant LIFEIFY surface, reviews the current state, enters or confirms data, and sees an immediate update in the timeline, dashboard, report, notification, or settings area. Sensitive medical information is shown with clear provenance, confirmation state, and edit/revoke controls where applicable.

## Data Required

The feature requires the minimum structured data needed to represent `Daily Progress` safely:

- `id`
- `userId`
- `featureKey`
- `value`
- `unit`
- `recordedAt`
- `sourceType`
- `sourceId`
- `confidence`
- `isUserConfirmed`
- `createdAt`
- `updatedAt`

## Data Sources

- Manual entry
- Quiz
- Voice
- Health Connect
- Apple Health
- Wearable
- Document
- Doctor
- Caregiver

## Primary Data Source

User-confirmed profile, tracking, or app workflow data.

## Fallback Data Source

Manual entry, quick log, or quiz-based collection when automatic data is unavailable.

If the preferred source is unavailable, LIFEIFY remains useful through manual logging, quick log flows, quiz-based collection where appropriate, medical document ingestion, voice drafts, and doctor/caregiver input when permission exists.

## Quiz Collection

A quiz can collect missing context using clear choices and user confirmation.

Quiz answers must be stored as `sourceType = QUIZ`, marked self-reported unless separately verified, and must never be converted into fabricated measured clinical values.

## Tracking Frequency

daily, event-based, or continuous where device data exists.

## Data Model

Primary entities may include:

- `User`
- `HealthProfile`
- `HealthLog`
- `HealthMetric`
- `MedicalRecord`
- `Medication`
- `Notification`
- `Consent`
- `AuditLog`

Additional fields and entities should be scoped to the category `Dashboard` and linked by stable IDs with source metadata.

## Validation

- Validate required fields, units, timestamps, user ownership, and source provenance.
- Reject impossible dates, unsupported units, malformed values, duplicate identifiers, and unauthorized access.
- Clinical measurements must come from a real measurement, device, document, or explicit manual entry.
- Self-reported and estimated values must be labeled visibly and stored distinctly from verified medical facts.

## User Confirmation

Required when data is manually entered, imported from a new source, extracted from a document, or used for sharing.

## Analytics

The feature can feed deterministic analytics such as completeness, trends, adherence, progress, streaks, summaries, and data-quality indicators. V3 may use the normalized output only after consent, validation, and provenance checks.

## Dependencies

User profile, consent management, source metadata, audit logs, and any related tracking records.

## Notifications

Notifications may be triggered only when the user has enabled the relevant preference and when the underlying data is sufficiently reliable. Medical or emergency-style messages must be informational and route users toward appropriate care instead of making autonomous treatment decisions.

## Privacy

This feature handles personal health information and must enforce consent, least-privilege access, encryption in transit and at rest, role-based visibility, audit logging, revocation, deletion, and export rights. Sharing with doctors, caregivers, family members, emergency viewers, or AI systems must be explicit and traceable.

## Edge Cases

- No data exists yet.
- Source data is stale, partial, conflicting, or unverified.
- The user revokes a permission after data has been imported.
- Two sources report different values for the same time period.
- A caregiver, doctor, or family member has insufficient permission.
- Offline drafts sync later and conflict with server data.

## Empty State

Show a calm empty state explaining that no `Daily Progress` data exists yet, then offer the safest next action: connect a supported source, enter data manually, use quick log, answer a short quiz, upload a document, or invite an approved contributor where applicable.

## Failure State

When collection, sync, OCR, payment, sharing, notification, or AI processing fails, keep existing verified data unchanged, explain the failure in plain language, preserve an audit trail, and offer retry, manual entry, confirmation, or support paths.

## V1/V2/V3

V1 deterministic feature. No AI/ML/LLM dependency is required.

## Medical Safety Notes

- LIFEIFY must not diagnose from this feature alone.
- LIFEIFY must not tell the user to start, stop, or change medication autonomously.
- Prescription and OCR-derived medication data require user confirmation.
- Missing medical data must remain missing instead of being guessed.
- AI-derived content must remain separate from verified medical facts.
