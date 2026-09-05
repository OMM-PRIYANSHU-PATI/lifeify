# LIFEIFY — Personal Health Operating System

> **A Calm, Intelligent, Trustworthy Health Operating System**  
> Unifying personal fitness, nutrition, sleep, biometrics, medical records, prescription OCR, medication adherence, drug interactions, clinical risk scores, emergency medical profiles, caregiver collaboration, and wearable telemetry.

[![Tests](https://img.shields.io/badge/tests-75%2F75%20passed-0E7C6B)](https://github.com/OMM-PRIYANSHU-PATI/lifeify)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Standalone%20Ready-0E7C6B)](https://web.dev/progressive-web-apps/)
[![Android](https://img.shields.io/badge/Android-API%2024%2B-green)](https://developer.android.com/)

---

## 🌟 Overview & Key Capabilities

LIFEIFY is engineered as a unified **Personal Health Operating System (OS)** that bridges day-to-day wellness with hospital-grade clinical precision. Built to serve both mobile and desktop users with an installable **Amazon-style PWA WebApp** and a dedicated **Native Android Studio Project (`android/`)**.

### Core Pillars

1. **Gamified Tri-Factor Predictor (Recovery · Mood · Sleep)**
   - 4-step interactive micro-game predicting recovery readiness (0–100%), sleep duration/quality, and mood valence in under 30 seconds.
   - Eliminates tedious manual data guessing while physical trackers (steps, calories, hydration, vitals) remain direct.
2. **Medication Operating System & Pharmacokinetics**
   - Deterministic dose schedules, taken/skipped logs, inventory count, and refill alarms.
   - Real-time half-life decay curves and multi-dose steady-state concentration tracking.
   - Comprehensive Drug-Drug Interaction (DDI) matrix and Drug-Food interaction engine (e.g., Metformin + Alcohol, Atorvastatin + Grapefruit).
   - Side effect logging and standardized CDSCO ADR reporting forms.
3. **Clinical Intelligence & Risk Calculators**
   - **IDRS (Indian Diabetes Risk Score)** with waistline chart (32"–46" waist).
   - **Framingham 10-Year Cardiovascular Disease (CVD)** risk estimator.
   - **Emergency Triage Engine** for real-time symptom severity assessment.
4. **Medical Records & Prescription Scanner**
   - Camera document capture, multi-page PDF processing, timeline view, and OCR text confirmation.
5. **Emergency Medical Profile & Care Circle**
   - Offline-first Emergency Medical Card with instant QR code generator.
   - Doctor collaboration portal, caregiver delegation, and exportable FHIR-aligned health bundles.
6. **Ecosystem & Wearables**
   - Device sync mockups for Fitbit, Apple Health, and Google Fit.
   - Voice symptom and food logging with natural language processing.
   - Lab test booking and pharmacy refill integration.

---

## 📱 Platforms & Delivery

### 1. Amazon-Style Installable WebApp (PWA)
- **Standalone Mode**: Configured via [`public/manifest.webmanifest`](public/manifest.webmanifest) with theme `#0E7C6B`, app shortcuts, and custom icons (`192px`, `512px`, `apple-touch-icon`).
- **Offline Resiliency**: Powered by [`public/sw.js`](public/sw.js) with stale-while-revalidate caching and fallback to [`public/offline.html`](public/offline.html) ensuring emergency QR and cards remain accessible without an internet connection.
- **Smart Install Banner**: Automatically prompts installation on Chromium browsers and provides guided home-screen instructions on iOS Safari.

### 2. Native Android Application Project (`android/`)
- Location: [`android/`](android/)
- Built with Android Studio Gradle (`minSdk 24`, `targetSdk 34`, package `app.lifeify.health`).
- Hardware-accelerated 60fps WebView, native camera file chooser for Prescription OCR, pull-to-refresh, offline asset fallback, and deep link handling (`lifeify://` and `https://lifeify.app`).

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript (Strict mode, 0 compilation errors)
- **Database & ORM**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Styling**: Tailwind CSS with custom medical-grade tokens (`#0E7C6B`, `#FAFAF8`, `#17201D`, `#F4A259`)
- **Testing**: Vitest test suite with 15 test files and 75 passing unit/integration tests

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/OMM-PRIYANSHU-PATI/lifeify.git
cd lifeify

# Install dependencies
npm install

# Initialize database schema
npx prisma generate
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

```bash
# Run full Vitest suite (15 suites, 75 tests)
npm test

# Run TypeScript typecheck
npx tsc --noEmit
```

---

## 🤖 Android Studio Build

```bash
# Open the android directory in Android Studio
cd android

# Build debug APK via Gradle wrapper
./gradlew assembleDebug
```
The resulting APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🔒 Privacy & Safety Guidelines

- **Zero Speculative AI in Clinical Math**: All clinical risk scores (IDRS, Framingham, DDI checks, Health Score, Tri-Factor predictions) are computed deterministically using peer-reviewed medical formulas.
- **Emergency Medical Resiliency**: Emergency QR and cards are accessible offline in all conditions.
- **Consent & Caregiver Access**: Role-based access control with granular patient permissions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
