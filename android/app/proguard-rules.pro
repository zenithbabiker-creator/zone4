# ProGuard rules for Zone App
# These rules ensure R8/ProGuard does not strip away any critical code

# 1. Protect Capacitor Core & Plugins (The Bridge)
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.BridgeActivity { *; }

# 2. Protect BuildConfig (Where your API Keys are injected)
-keep class com.zoon.agri.app.BuildConfig { *; }

# 3. WebView & JavaScript Interface Protection
# This is crucial for JS logic to communicate with Native (Camera, GPS, etc)
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 4. Preserve debugging info for Google Play Console crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# 5. General Android Support rules
-dontwarn com.google.android.gms.**
-keep class com.google.android.gms.** { *; }

# 6. AI Models & JSON Protection (Keep Attributes & Variable Names)
-keepattributes Signature, *Annotation*, EnclosingMethod, InnerClasses
-keepclassmembernames class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-dontwarn java.lang.invoke.MethodHandle
-dontwarn java.lang.invoke.MethodHandles$Lookup
