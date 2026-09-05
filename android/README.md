# LIFEIFY — Android Native & WebApp Wrapper

This directory contains the complete native Android project for **LIFEIFY**, allowing it to be compiled into an Android APK or opened directly in **Android Studio**.

---

## 📱 Features

1. **Hardware-Accelerated WebView**:
   - Runs the complete LIFEIFY Personal Health Operating System at 60fps.
   - Dom storage, database, and hardware rendering enabled.
2. **Camera & File Upload for Prescription OCR**:
   - `onShowFileChooser` wired up for camera photo capture and PDF uploads in Prescription OCR and Health Records.
3. **Offline Resiliency**:
   - If the device loses internet connection, it automatically serves `file:///android_asset/offline.html` so users never see an `ERR_INTERNET_DISCONNECTED` crash.
4. **Android Native Navigation**:
   - Physical Back button navigates through web history before exiting the application.
5. **Swipe-to-Refresh**:
   - Native `SwipeRefreshLayout` with LIFEIFY teal theme colors.
6. **Deep Linking**:
   - Handles `lifeify://` and `https://lifeify.app` intents.

---

## 🛠️ How to Build and Run

### Option 1: Using Android Studio (Recommended)
1. Open **Android Studio**.
2. Click **Open** and select the `E:\project\lifeify\android` directory.
3. Android Studio will automatically synchronize the Gradle project.
4. Connect an Android phone via USB (with USB Debugging enabled) or start an Android Virtual Device (AVD) emulator.
5. Click the green **Run** ▶ button.

### Option 2: Build APK via Command Line
Run the following inside `E:\project\lifeify\android`:

```bash
# For Debug APK
./gradlew assembleDebug

# For Release APK
./gradlew assembleRelease
```

The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

To install directly to a connected phone:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🌐 Amazon-Style PWA (Install Without App Store)

On any Android phone, open Chrome and navigate to your LIFEIFY instance:
1. Chrome will display the **"Install LIFEIFY Health App"** banner at the top/bottom.
2. Tap **Install App**.
3. LIFEIFY will be added directly to the Android app drawer and home screen as a standalone application.
