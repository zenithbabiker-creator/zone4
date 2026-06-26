# دليل أيقونات تطبيق مشتل زون (Google Play & Android)

بناءً على المواصفات التقنية المطلوبة، تم تجهيز التطبيق برمجياً لدعم الأيقونات التكيفية (Adaptive Icons). فيما يلي التعليمات النهائية لتجهيز الأصول البصرية:

## 1. أيقونة متجر جوجل بلاي (Google Play Icon)
*   **المقاس:** 512x512 بكسل.
*   **التنسيق:** PNG (32-bit).
*   **المصدر المقترح:** استخدم ملف `public/logo.png` (أو الرابط https://i.ibb.co/qFgDcx2b/logo.png).
*   **طريقة التحضير:** ضع الشعار في مركز خلفية مربعة بيضاء تماماً. تأكد من وجود "تنفس" (Padding) حول الشعار بنسبة 15%.
*   **ملاحظة:** جوجل سيقوم بتدوير الحواف تلقائياً، فلا تقم بتدويرها بنفسك.

## 2. أيقونات النظام التكيفية (Adaptive Icons)
تم تقسيم الأيقونة إلى طبقتين لتعمل مع جميع أجهزة أندرويد الحديثة:

### أ. الطبقة الخلفية (Background) - [جاهزة برمجياً]
*   تم ضبطها على اللون الأبيض الصافي لضمان التناسق.
*   المسار: `android/app/src/main/res/values/ic_launcher_background.xml`.

### ب. الطبقة الأمامية (Foreground)
*   **المقاس:** 108x108 بكسل.
*   **المنطقة الآمنة (Safe Zone):** يجب أن يتوسط الشعار الصورة ويكون داخل دائرة بقطر **66 بكسل**.
*   **التنسيق:** PNG مع شفافية.
*   **المسارات المطلوب استبدالها:** يجب استبدال الصور في المجلدات التالية بصورتك الجديدة:
    *   `android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png`
    *   `android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png`
    *   `android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png`
    *   `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png`
    *   `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`

## 3. نصائح تقنية للقبول
*   لا تضف أي نص مثل "Zone" تحت الشعار داخل الأيقونة.
*   تجنب استخدام التدرجات اللونية المعقدة في الخلفية؛ الأبيض أو الأخضر السادة (#065f46) هو الأفضل.
*   إذا كنت تستخدم أداة **Android Studio**، يمكنك استخدام `Image Asset Studio` واختيار شعارنا كـ `Foreground Layer` واللون الأبيض كـ `Background Layer` وسيقوم هو بتوليد كافة المقاسات تلقائياً.

---
تم إعداد الكود المصدري ليكون متوافقاً مع هذه التغييرات بمجرد استبدال الصور.
