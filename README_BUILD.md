# دليل بناء وتوقيع التطبيق (Build & Signing Guide)
## المرحلة الأولى: تهيئة بيئة العمل في Google Play
1. في لوحة تحكم Google Play، احصل على `Package Name` (مثل: `com.zone.agribusiness`).
2. تأكد من مطابقة هذا الاسم في ملف `capacitor.config.ts`.

## المرحلة الثانية: التوقيع الإلكتروني (Signing)
للحصول على ملف **AAB** جاهز للرفع، اتبع هذه الخطوات في Terminal الخاص بـ IDX:

1. **توليد مفتاح التوقيع (Keystore):**
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias zone-key
   ```
   *(ملاحظة: استخدم كلمة المرور `zone2026` كما هو محدد في ملف DEPENDENCIES_STABILITY.yaml)*

2. **تهيئة Gradle للتوقيع:**
   افتح ملف `android/app/build.gradle` وأضف إعدادات `signingConfigs`.

## المرحلة الثالثة: بناء ملف AAB
من المجلد الرئيسي للتطبيق، قم بتشغيل:
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```
سيكون الملف الناتج في المسار:
`android/app/build/outputs/bundle/release/app-release.aab`

## المكتبات والإصدارات المعتمدة (Stable Stack)
- **Capacitor:** 6.0.0 (الأكثر استقراراً حالياً لـ Android 14)
- **Node.js:** 20.x
- **JDK:** 17 (ضروري لـ Gradle 8+)
- **Android API:** 34
