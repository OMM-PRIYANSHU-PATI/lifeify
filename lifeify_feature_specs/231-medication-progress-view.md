# Feature 231: Medication Progress View

## Metadata

| Field | Value |
| --- | --- |
| Feature Number | 231 |
| Version | V2 |
| Category | Advanced Medication & Engagement |
| Feature Key | `medication_progress_view` |

## Purpose

Medication Progress View supports safe medication organization, schedule tracking, adherence visibility, and user-confirmed treatment records.

## User Experience

The user reaches this feature from the relevant LIFEIFY surface, reviews the current state, enters or confirms data, and sees an immediate update in the timeline, dashboard, report, notification, or settings area. Sensitive medical information is shown with clear provenance, confirmation state, and edit/revoke controls where applicable.

## Data Required

The feature requires the minimum structured data needed to represent `Medication Progress View` safely:

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
- `medicationId`
- `scheduleId`
- `doseId`
- `status`
- `takenAt`
- `skippedReason`

## Data Sources

- Prescription
- Manual entry
- OCR
- Quiz
- Doctor
- Caregiver

## Primary Data Source

User-confirmed prescription or manually created medication record.

## Fallback Data Source

Manual entry or medication quiz; dose, frequency, and duration must remain blank until confirmed.

If the preferred source is unavailable, LIFEIFY remains useful through manual logging, quick log flows, quiz-based collection where appropriate, medical document ingestion, voice drafts, and doctor/caregiver input when permission exists.

## Quiz Collection

A medication quiz can collect name, dose, schedule, adherence, stock, and side effects only when the user confirms them.

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

Additional fields and entities should be scoped to the category `Advanced Medication & Engagement` and linked by stable IDs with source metadata.

## Validation

- Validate required fields, units, timestamps, user ownership, and source provenance.
- Reject impossible dates, unsupported units, malformed values, duplicate identifiers, and unauthorized access.
- Clinical measurements must come from a real measurement, device, document, or explicit manual entry.
- Self-reported and estimated values must be labeled visibly and stored distinctly from verified medical facts.

## User Confirmation

Yes. User confirmation is required before storing or sharing sensitive health data.

## Analytics

The feature can feed deterministic analytics such as completeness, trends, adherence, progress, streaks, summaries, and data-quality indicators. V3 may use the normalized output only after consent, validation, and provenance checks.

## Dependencies

Health profile, allergy profile, prescription data when available, medication schedule, reminders, adherence, and doctor summary.

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

Show a calm empty state explaining that no `Medication Progress View` data exists yet, then offer the safest next action: connect a supported source, enter data manually, use quick log, answer a short quiz, upload a document, or invite an approved contributor where applicable.

## Failure State

When collection, sync, OCR, payment, sharing, notification, or AI processing fails, keep existing verified data unchanged, explain the failure in plain language, preserve an audit trail, and offer retry, manual entry, confirmation, or support paths.

## V1/V2/V3

V2 deterministic feature. No AI/ML/LLM dependency is required.

## Medical Safety Notes

- LIFEIFY must not diagnose from this feature alone.
- LIFEIFY must not tell the user to start, stop, or change medication autonomously.
- Prescription and OCR-derived medication data require user confirmation.
- Missing medical data must remain missing instead of being guessed.
- AI-derived content must remain separate from verified medical facts.
