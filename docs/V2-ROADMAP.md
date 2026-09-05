# LIFEIFY V2 Roadmap — Complete Non-AI Healthcare Ecosystem

> Source: founder's V2 implementation plan (2026-09-04). Extends the V1 codebase in place —
> no new project. **No AI/ML/LLM in V2** — everything deterministic, rule-based, or an external
> integration. AI/ML remains reserved for V3.

## Version philosophy

- **V1** — Core deterministic healthcare platform (this codebase, current milestone)
- **V2** — Complete connected, family, doctor, wellness ecosystem — still without AI/ML
- **V3** — AI/ML intelligence, prediction, personalization, clinical decision-support research layer

Rule for V2: *everything that can be implemented without AI/ML should be completed in V2.*
Each feature ships as a **vertical slice** (DB → service → API → UI → notification), never a
horizontal layer. Every slice preserves V1 invariants: privacy, audit logging, RBAC, Zod
validation, private file storage.

## Module map (build order)

| # | Module | Phase | Depends on |
|---|--------|-------|------------|
| 1 | RBAC + permissions foundation | 1 | V1 auth |
| 2 | Audit log system (immutable, actor/target/action/resource/IP) | 1 | RBAC |
| 3 | Notification engine v2 (rules registry + dispatcher + web push later) | 1 | — |
| 4 | Health metric canonical model | 2 | — |
| 5 | Provider adapter architecture (`lib/providers/*`) | 2 | Canonical model |
| 6 | Google Health Connect (OAuth + normalize + idempotent sync) | 2 | Provider adapter |
| 7 | Apple Health (user-uploaded export zip → stream parse → normalize) | 2 | Provider adapter |
| 8 | Manual entry + reconciliation (manual wins within 24h window) | 2 | Canonical model |
| 9 | Family profiles (household, invite-by-phone OTP, guardian-owned minors) | 3 | RBAC, audit |
| 10 | Caregiver access + permissions (time-bound ≤12mo, revocable, audited) | 3 | Family, RBAC |
| 11 | Doctor accounts (role=doctor + verified DoctorProfile, admin-approved) | 4 | RBAC, audit |
| 12 | Doctor-patient access grants (10-min access code → read-only scope) | 4 | Doctor, RBAC |
| 13 | Doctor dashboard (`/doctor/*`, read-only + notes/appointments) | 4 | Access grants |
| 14 | Appointments + doctor notes (+ reminders) | 4 | Doctor dashboard |
| 15 | Fitness plans (rule engine → weekly schedule, no AI exercises) | 5 | Rule engine |
| 16 | Nutrition plans (TDEE + diet rules + curated Indian food DB) | 5 | Food DB, rules |
| 17 | Sleep plans (deterministic sleep hygiene program) | 5 | Rule engine |
| 18 | Health goals + progress tracking | 5 | Notification |
| 19 | Gamification (points, streaks, badges: bronze→silver→gold→diamond) | 5 | Goals |
| 20 | Advanced analytics (mean/median/trend/rolling/Pearson r≥0.3 & n≥14 only) | 6 | Canonical model |
| 21 | Voice logging (STT provider → rule-based intent parse → **mandatory confirm**) | 6 | Notification |
| 22 | Subscription (Razorpay: UPI/cards, webhooks, grace period, entitlements) | 7 | Audit |
| 23 | Usage limits + free tier (soft cap at 80%, hard cap at 100%) | 7 | Subscription |
| 24 | Hindi localization (i18n, en/hi message files, no hardcoded strings) | 8 | All UI |
| 25 | Accessibility (WCAG 2.1 AA, aria-live errors, chart data tables) | 8 | All UI |
| 26 | PWA + offline (offline queue for check-ins/water/mood/weight; server timestamp wins) | 9 | All above |
| 27 | Data export + deletion (JSON/CSV/PDF, per-category export) | 9 | RBAC, audit |

## Canonical health metric model (the V3 substrate)

```
HealthMetric: id, userId, type(MetricType enum), value, unit, startTime, endTime,
              source(manual|google_health_connect|apple_health|…), sourceId, metadata
UNIQUE (userId, type, source, sourceId)   // idempotent ingestion
```

- **Time ranges, not points** (sleep, distance, active minutes are intervals)
- **Idempotent**: same provider sourceId never duplicates
- **Unit stored at write time**; normalization happens on write, never on read
- Metric types: steps, distance, active_minutes, calories_burned, sleep_*, heart_rate*,
  spo2, respiratory_rate, body_temperature, weight, body_fat, bmi, water, calories_intake,
  protein/carbs/fat, blood_pressure_systolic/diastolic, blood_glucose

## Schema additions (extend V1 Prisma schema)

- **Family:** Family, FamilyMember, Caregiver, CaregiverPermission, FamilyHealthShare
- **Wearables:** ConnectedDevice, HealthDataSource, HealthDataSync, ExternalHealthRecord
- **Plans:** FitnessPlan(+Day), NutritionPlan(+Day), SleepPlan, PlanActivity, PlanCompletion
- **Doctor:** Doctor(profile), DoctorPatient, DoctorAccessGrant, DoctorNote, DoctorAppointment, DoctorSharedReport
- **Advanced health:** HealthGoal, HealthGoalProgress, HealthBaseline, HealthMetric, HealthMetricAggregation
- **Notifications:** NotificationPreference, NotificationDelivery, NotificationSchedule
- **Subscription:** Plan, Payment, Invoice, FeatureEntitlement, UsageEvent

## Hard boundaries (V2 must NOT do)

No AI assistant, no LLM answers, no AI diagnosis, no ML prediction, no AI report
interpretation, no AI medication verdicts, no ML anomaly detection, no AI drug interactions,
no predictive risk scores, no autonomous decisions. Medication progress view shows
**"your recorded trends during this treatment period — discuss with your healthcare
professional"**, never "medicine is working".

## Key flows

- **Doctor access:** patient generates 10-min access code → doctor redeems → read-only grant → revocable, audited
- **Voice logging:** audio → STT → rule-based intent parse → **user confirms** → write (never auto-write)
- **Wearable sync:** provider → adapter → normalize → HealthMetric (dedupe by sourceId)
- **Caregiver:** patient grants time-bound permission set (basic/medical) → caregiver sees only that slice

## V2→V3 data contract

V2's entire purpose beyond features: produce **clean, normalized, quality-checked structured
data** (health, medical, medication) so V3 AI/ML can consume it directly.
