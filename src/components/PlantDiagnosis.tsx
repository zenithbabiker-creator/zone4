import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Leaf, X, Camera, Upload, ImageIcon, Sprout, FlaskConical, 
  CheckCircle, AlertTriangle, Trees, Flower, Flower2, LeafyGreen, 
  RefreshCw, AlertCircle
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource as CapacitorCameraSource } from '@capacitor/camera';

// Helper to downscale and compress base64 images client-side to prevent large payload errors (e.g., HTTP 413)
// and to avoid the "unexpected token doctype" error caused by server/network timeouts when uploading giant photos.
const compressImage = (base64Str: string, maxDimension = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Reduce size & compress to high-quality JPEG
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

const getApiUrl = (path: string): string => {
  const isNative = Capacitor.isNativePlatform() || 
                    window.location.origin.includes('localhost') || 
                    window.location.origin.includes('capacitor://') ||
                    window.location.origin.includes('file://');
  
  if (isNative) {
    const configuredUrl = import.meta.env.VITE_PROD_URL || (import.meta.env as any).VITE_API_URL;
    if (configuredUrl) {
      const baseUrl = configuredUrl.replace(/\/$/, "");
      return `${baseUrl}${path}`;
    }
    const defaultProdUrl = "https://ais-pre-svw5ykbmqk4up2f4hyeix3-740760212521.europe-west2.run.app";
    return `${defaultProdUrl}${path}`;
  }
  
  return path;
};

interface PlantDiagnosisProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlantDiagnosis = ({ isOpen, onClose }: PlantDiagnosisProps) => {
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [closeImage, setCloseImage] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<'full' | 'close' | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [showWebcam, setShowWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Clear states when opening
      setFullImage(null);
      setCloseImage(null);
      setResult(null);
      setWarning(null);
      setLoading(false);
      setShowWebcam(false);
      setWebcamError(null);
    } else {
      stopWebcam();
      setShowWebcam(false);
    }
    return () => {
      stopWebcam();
    };
  }, [isOpen]);

  const startWebcam = async (slot: 'full' | 'close') => {
    setActiveSlot(slot);
    setShowWebcam(true);
    setWebcamError(null);
    setWarning(null);

    // Timeout fallback: if the stream doesn't acquire within 5 seconds, fall back gracefully
    const fallbackTimeout = setTimeout(() => {
      if (showWebcam && !streamRef.current) {
        console.warn("Webcam acquisition timed out. Falling back to native picker.");
        handleWebcamFallback();
      }
    }, 5000);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      clearTimeout(fallbackTimeout);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Video auto play failed:", e));
      }
    } catch (err: any) {
      console.warn("Direct ideal facingMode environment failed, trying standard video device", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        clearTimeout(fallbackTimeout);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log("Video auto play failed fallback:", e));
        }
      } catch (fallbackErr: any) {
        clearTimeout(fallbackTimeout);
        console.warn("All webcam initializations failed gracefully (falling back to file inputs):", fallbackErr);
        handleWebcamFallback();
      }
    }
  };

  const handleWebcamFallback = () => {
    stopWebcam();
    setShowWebcam(false);
    setWarning("لم نتمكن من فتح الكاميرا المباشرة تلقائياً. تم التوجيه إلى ملتقط الصور الافتراضي لهاتفك.");
    cameraInputRef.current?.click();
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureWebcamPhoto = async () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        try {
          const compressed = await compressImage(dataUrl);
          if (activeSlot === 'full') {
            setFullImage(compressed);
          } else if (activeSlot === 'close') {
            setCloseImage(compressed);
          }
        } catch (e) {
          if (activeSlot === 'full') {
            setFullImage(dataUrl);
          } else if (activeSlot === 'close') {
            setCloseImage(dataUrl);
          }
        }
        setWarning(null);
        stopWebcam();
        setShowWebcam(false);
      }
    }
  };

  const initiateCameraCapture = async (slot: 'full' | 'close') => {
    setActiveSlot(slot);
    setWarning(null);
    if (!Capacitor.isNativePlatform()) {
      // Start immersive in-app live webcam interface for web browsers
      startWebcam(slot);
    } else {
      try {
        const photo = await CapacitorCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CapacitorCameraSource.Camera, // Force Camera source for direct native capture
          correctOrientation: true
        });
        
        if (photo.dataUrl) {
          try {
            const compressed = await compressImage(photo.dataUrl);
            if (slot === 'full') {
              setFullImage(compressed);
            } else {
              setCloseImage(compressed);
            }
          } catch (e) {
            if (slot === 'full') {
              setFullImage(photo.dataUrl);
            } else {
              setCloseImage(photo.dataUrl);
            }
          }
        }
      } catch (err) {
        console.error("Capacitor camera capture error:", err);
      }
    }
  };

  const initiateFileBrowse = async (slot: 'full' | 'close') => {
    setActiveSlot(slot);
    setWarning(null);
    if (!Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
    } else {
      try {
        const photo = await CapacitorCamera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CapacitorCameraSource.Photos, // Force Photo library/Files for direct browse
          correctOrientation: true
        });
        
        if (photo.dataUrl) {
          try {
            const compressed = await compressImage(photo.dataUrl);
            if (slot === 'full') {
              setFullImage(compressed);
            } else {
              setCloseImage(compressed);
            }
          } catch (e) {
            if (slot === 'full') {
              setFullImage(photo.dataUrl);
            } else {
              setCloseImage(photo.dataUrl);
            }
          }
        }
      } catch (err) {
        console.error("Capacitor photo browse error:", err);
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const loadedImg = reader.result as string;
        try {
          const compressed = await compressImage(loadedImg);
          if (activeSlot === 'full') {
            setFullImage(compressed);
          } else if (activeSlot === 'close') {
            setCloseImage(compressed);
          }
        } catch (err) {
          if (activeSlot === 'full') {
            setFullImage(loadedImg);
          } else if (activeSlot === 'close') {
            setCloseImage(loadedImg);
          }
        }
        setWarning(null);
      };
      reader.readAsDataURL(file);
    }
    // reset file input
    if (e.target) e.target.value = '';
  };

  const startDiagnosis = async () => {
    if (!fullImage || !closeImage) {
      setWarning("عذراً، تشخيص 'طبيب زون' الزراعي يتطلب رفع 'الصورتين معاً' لضمان الدقة:\n1. صورة توضح الهيكل الكامل للنبتة وبيئتها.\n2. صورة قريبة جداً (Close-up) لمكان ومظهر الإصابة/التبقعات.");
      return;
    }

    setWarning(null);
    setLoading(true);
    setProgress(0);
    setResult(null);

    // Adaptive smooth progressive steps simulation ("رويداً رويداً" - step-by-step gracefully)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev;
        // Asymmetric decay progression: slow down naturally as we approach 99%
        const remaining = 99 - prev;
        // Gradual, proportional scaling:
        // When remaining is high, advance faster. When remaining is low, advance in smaller, precise increments.
        const multiplier = remaining > 50 ? 0.08 : (remaining > 15 ? 0.04 : 0.015);
        const increment = (remaining * multiplier) + (Math.random() * 0.4 + 0.1);
        return Math.min(prev + increment, 99);
      });
    }, 300);

    try {
      const savedOpenRouterKey = localStorage.getItem('custom_openrouter_key');
      const response = await fetch(getApiUrl('/api/plant/diagnose'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullImage,
          closeImage,
          openRouterKey: savedOpenRouterKey || undefined
        })
      });

      if (!response.ok) {
        let errText = '';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errText = errData?.error || `خطأ في الخادم (رمز الحالة: ${response.status})`;
          } else {
            const textText = await response.text();
            if (response.status === 413 || textText.includes("Payload Too Large") || textText.includes("too large")) {
              errText = "حجم الفحص كبير جداً على حماية السحابة! يرجى تصوير النبات بدقة متوسطة أو ضغط الصور من الكاميرا قبل رفعها لضمان تشخيص سريع وناجح.";
            } else if (response.status === 401 || response.status === 403 || textText.includes("Unauthorized") || textText.includes("Sign in")) {
              errText = "انتهت جلسة العمل أو تم تسجيل الخروج في هذا المتصفح. يرجى التحديث وإعادة تسجيل الدخول أو مراجعة إعدادات مشاركة التطبيق.";
            } else if (textText.startsWith("<!DOCTYPE") || textText.startsWith("<html")) {
              errText = `لم نتمكن من الوصول لخدمة زون الخلفية بنجاح (رمز الحالة: ${response.status}). يرجى التأكد من تسجيل الدخول أو إذن الرابط المشترك.`;
            } else {
              errText = `استجابة غير متوقعة من السيرفر (رمز الحالة ${response.status}).`;
            }
          }
        } catch (e) {
          errText = `حدث خطأ أثناء فحص استجابة الخادم (رمز الحالة ${response.status}).`;
        }
        throw new Error(errText);
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html") || responseText.includes("doctype")) {
          throw new Error(
            `عذراً! يبدو أن التطبيق محمي بجدار حماية بيئة التطوير الخاصة بـ Google AI Studio ويمنع هذا اللابتوب الآخر من الاتصال بالخلفية مباشرة.

💡 لحل هذه المشكلة بسرعة وسهولة:
1. تأكد من تسجيل الدخول باستخدام حساب جوجل (Gmail) المرتبط بالتطبيق على المتصفح في هذا الجهاز الآخر.
2. يرجى فتح التطبيق في علامة تبويب كاملة مستقلة (New Tab) بدلاً من الإطار (Iframe) لتفادي قيود المتصفح على ملفات الكوكيز والاتصال.
3. يمكنك تصدير النسخة أو نشرها للعامة (Public Deploy) بدون قيود أمنية عبر قائمة الإعدادات في واجهة AI Studio.`
          );
        } else {
          throw new Error(`خطأ في معالجة بيانات الفحص المستلمة: ${responseText.substring(0, 80)}...`);
        }
      }

      setProgress(100);
      setResult(data);

      if (data && data.freshOpenRouterKey) {
        console.log("[PlantDiagnosis] Received a fresh OpenRouter key from server, saving to localStorage:", data.freshOpenRouterKey);
        localStorage.setItem('custom_openrouter_key', data.freshOpenRouterKey);
      }

      if (data && !data.error) {
        // Grand multi-burst award celebration confetti
        try {
          const duration = 2.5 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 9999 };

          const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
          };

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 45 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 200);

          // Initial grand central burst
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.55 },
            zIndex: 9999
          });
        } catch (confError) {
          console.warn("Confetti call bypassed:", confError);
        }
      }
    } catch (err: any) {
      console.error("Diagnosis failed:", err);
      setResult({
        error: err.message || "عذراً، واجهنا صعوبة في التواصل مع نظام الفحص السحابي لزون. يرجى تكرار المحاولة."
      });
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[90] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative"
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-green-50/70 z-20 relative">
          <div className="flex items-center space-x-reverse space-x-3">
            <Leaf className="text-green-600 animate-pulse" size={24} />
            <h2 className="text-xl font-black text-green-900 font-sans">طبيب زون الذكي</h2>
          </div>
          <button 
            onClick={() => { 
                onClose(); 
                setFullImage(null); 
                setCloseImage(null); 
                setResult(null); 
            }} 
            className="p-2 hover:bg-green-100 rounded-full text-green-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Custom Input for Web File Upload */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Custom Input for Web direct Camera Capture */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={cameraInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative bg-slate-50/50">
          
          {/* Real-time In-App Webcam Interface */}
          {showWebcam && (
            <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-slate-900 rounded-[2rem] text-white min-h-[400px]" dir="rtl">
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-xs text-white/70 font-bold bg-white/10 px-3 py-1 rounded-full">
                  {activeSlot === 'full' ? '📷 التقاط الهيكل الكامل والبيئة' : '🔍 التقاط بؤرة المرض عن قرب (Close-up)'}
                </span>
                <span className="text-[10px] text-green-400 font-bold animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  بث الكاميرا المباشر نشط
                </span>
              </div>
              
              <div className="relative w-full aspect-video md:aspect-[4/3] max-w-md bg-black rounded-2xl overflow-hidden border-2 border-white/10 shadow-inner group">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
                
                {/* Visual Camera Overlay Grid */}
                <div className="absolute inset-0 border border-green-500/20 pointer-events-none flex flex-wrap">
                  <div className="w-1/3 h-full border-r border-green-500/10" />
                  <div className="w-1/3 h-full border-r border-green-500/10" />
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="h-1/3 w-full border-b border-green-500/10" />
                    <div className="h-1/3 w-full border-b border-green-500/10" />
                  </div>
                </div>

                {/* Direct circular preview indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 animate-pulse" />
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-sm justify-center">
                <button
                  type="button"
                  onClick={captureWebcamPhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-2xl font-black shadow-md hover:bg-green-700 active:scale-95 transition-all"
                >
                  <Camera size={18} />
                  <span>التقاط الصورة 📸</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopWebcam();
                    setShowWebcam(false);
                  }}
                  className="px-6 py-3 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 active:scale-95 transition-all"
                >
                  تراجع
                </button>
              </div>

              <p className="text-[10px] text-white/50 text-center max-w-xs leading-relaxed">
                ملاحظة: إذا كانت الكاميرا معطلة أو لم يتم منحها أذونات، فسيتم فتح تطبيق كاميرا جهازك أو ملتقط الملفات تلقائياً.
              </p>
            </div>
          )}

          {/* Main Upload / Control Screen */}
          {!loading && !result && !showWebcam && (
            <div className="space-y-6" dir="rtl">
              
              {/* Introduction Banner */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-3xl text-sm leading-relaxed text-emerald-950 font-bold flex gap-3 items-start">
                <Sprout className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                <p>
                  مرحباً بك في زون للخدمات الزراعية. لضمان دقة كاملة في تحديد اسم نبات الزينة وتشخيص آفته بدقة، تطلب منك الإرشادات الزراعية العالمية وجيمناي تزويدنا <span className="text-emerald-700 underline font-black">بصورتين معاً</span> من كاميرا هاتفك.
                </p>
              </div>

              {/* Warning Banner */}
              {warning && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 p-4 rounded-2xl text-xs font-black text-red-800 flex gap-2 items-center"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{warning}</span>
                </motion.div>
              )}

              {/* Two Slots Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Slot 1: Full Plant */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[310px]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-black">
                        الخطوة الأولى
                      </span>
                      {fullImage && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    <h3 className="font-black text-slate-800 text-sm mb-1">الصورة الأولى: الهيكل الكامل والبيئة</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      صورة شاملة لنظام ونبات الزينة بشكل كامل، تصف أوراقه وحجمه والبيئة المحيطة لتحديد اسم الفصيلة بدقة.
                    </p>
                  </div>

                  {fullImage ? (
                    <div className="relative h-32 rounded-2xl overflow-hidden mt-3 group border border-slate-100 bg-slate-950/5 flex items-center justify-center">
                      <img src={fullImage} className="w-full h-full object-contain" alt="Full plant structure preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => initiateCameraCapture('full')}
                          className="px-3 py-1.5 bg-white text-slate-900 rounded-full text-[11px] font-black hover:scale-105 transition-transform flex items-center gap-1 shadow"
                        >
                          <Camera size={12} />
                          <span>تصوير جديد</span>
                        </button>
                        <button 
                          onClick={() => initiateFileBrowse('full')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-[11px] font-black hover:scale-105 transition-transform flex items-center gap-1 shadow"
                        >
                          <Upload size={12} />
                          <span>رفع ملف</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => initiateCameraCapture('full')}
                        className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl font-black shadow-sm hover:from-emerald-700 hover:to-green-800 active:scale-[0.98] transition-all"
                      >
                        <Camera size={16} />
                        <span className="text-xs">التقاط بالكاميرا 📷</span>
                      </button>
                      <button 
                        onClick={() => initiateFileBrowse('full')}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 font-black hover:bg-slate-100 active:scale-[0.98] transition-all"
                      >
                        <Upload size={16} />
                        <span className="text-xs">رفع من الملفات 📂</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot 2: Close-up Disease Spot */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[310px]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-black">
                        الخطوة الثانية
                      </span>
                      {closeImage && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                      )}
                    </div>
                    <h3 className="font-black text-slate-800 text-sm mb-1">الصورة الثانية: بؤرة المرض عن قرب</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      خذ لقطة قريبة جداً (Close-up) تركز مباشرة على البقع، التصبغات، الإهتراء، أو بؤرة الإصابة في الأوراق أو السيقان.
                    </p>
                  </div>

                  {closeImage ? (
                    <div className="relative h-32 rounded-2xl overflow-hidden mt-3 group border border-slate-100 bg-slate-950/5 flex items-center justify-center">
                      <img src={closeImage} className="w-full h-full object-contain" alt="Close plant structure preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => initiateCameraCapture('close')}
                          className="px-3 py-1.5 bg-white text-slate-900 rounded-full text-[11px] font-black hover:scale-105 transition-transform flex items-center gap-1 shadow"
                        >
                          <Camera size={12} />
                          <span>تصوير جديد</span>
                        </button>
                        <button 
                          onClick={() => initiateFileBrowse('close')}
                          className="px-3 py-1.5 bg-orange-600 text-white rounded-full text-[11px] font-black hover:scale-105 transition-transform flex items-center gap-1 shadow"
                        >
                          <Upload size={12} />
                          <span>رفع ملف</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => initiateCameraCapture('close')}
                        className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-black shadow-sm hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] transition-all"
                      >
                        <Camera size={16} />
                        <span className="text-xs">التقاط بالكاميرا 📷</span>
                      </button>
                      <button 
                        onClick={() => initiateFileBrowse('close')}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 font-black hover:bg-slate-100 active:scale-[0.98] transition-all"
                      >
                        <Upload size={16} />
                        <span className="text-xs">رفع من الملفات 📂</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Engine */}
              <button 
                onClick={startDiagnosis}
                className={`w-full py-5 rounded-[2rem] font-sans font-black flex items-center justify-center gap-2.5 text-base shadow-lg transition-all ${
                  fullImage && closeImage 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:scale-[1.01] hover:shadow-xl cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>ابدأ الفحص الزراعي بواسطة زون ⚡</span>
              </button>

            </div>
          )}

          {/* Diagnosis Loader */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-green-100 shadow-xl mx-4">
              <div className="relative w-40 h-40 rounded-full border-4 border-green-200/50 bg-green-50/30 overflow-hidden shadow-inner flex items-center justify-center">
                
                {/* Simulated fluid rising */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-700 via-blue-500 to-sky-400 z-0"
                  initial={{ height: "0%" }}
                  animate={{ height: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />

                {progress > 0 && progress < 100 && (
                  <>
                    <motion.div
                      className="absolute left-0 right-0 h-6 bg-sky-300/40 opacity-70 rounded-[40%] z-0"
                      style={{ bottom: `calc(${progress}% - 8px)` }}
                      animate={{ 
                        rotate: 360,
                        x: [-10, 10, -10]
                      }}
                      transition={{ 
                        rotate: { repeat: Infinity, duration: 6, ease: "linear" },
                        x: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                      }}
                    />
                    <motion.div
                      className="absolute left-0 right-0 h-6 bg-blue-400/30 opacity-60 rounded-[45%] z-0"
                      style={{ bottom: `calc(${progress}% - 12px)` }}
                      animate={{ 
                        rotate: -360,
                        x: [10, -10, 10]
                      }}
                      transition={{ 
                        rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                        x: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                      }}
                    />
                  </>
                )}

                <div className="absolute inset-0 rounded-full border-[10px] border-white/20 pointer-events-none z-10" />

                <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-25 pointer-events-none animate-spin" style={{ animationDuration: '8s' }}>
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-green-100/10"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={452}
                    initial={{ strokeDashoffset: 452 }}
                    animate={{ strokeDashoffset: 452 - (452 * progress) / 100 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    strokeLinecap="round"
                    className="text-blue-500"
                  />
                </svg>

                <div className="relative z-30 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] font-sans">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-[10px] font-black text-yellow-300 tracking-wider mt-1 select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)] uppercase">
                    تحليل زون
                  </span>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-black text-emerald-950 text-xl animate-pulse">جاري فحص الصور المزدوجة...</p>
                <p className="text-green-700/60 font-bold text-xs">طبيب زون يقارن بين الهيكل وبؤرة المرض</p>
              </div>

              <div className="flex gap-4 opacity-40">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><Leaf size={24} className="text-green-600" /></motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}><Sprout size={24} className="text-green-600" /></motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}><FlaskConical size={24} className="text-green-600" /></motion.div>
              </div>
            </div>
          )}

          {/* Diagnosis Results Screen */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 relative pb-12 w-full"
            >
              
              {result.error ? (
                <div role="alert" className="relative z-20 p-10 bg-white/80 backdrop-blur-md rounded-[3rem] border-2 border-red-100 flex flex-col items-center text-center space-y-6 shadow-2xl" dir="rtl">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle size={48} className="text-red-500" />
                  </div>
                  <p className="font-sans font-black text-red-900 text-lg leading-relaxed">{result.error}</p>
                </div>
              ) : (
                <div className="relative z-20 space-y-8 text-right" dir="rtl">
                  
                  {/* Both Images SidebySide or Tabbed layout */}
                  <div className="grid grid-cols-2 gap-4 h-48 sm:h-64">
                    <div className="relative rounded-[2rem] overflow-hidden shadow-md border-4 border-white bg-slate-950/5 flex items-center justify-center">
                      <img src={fullImage || ''} alt="Full view" className="w-full h-full object-contain" />
                      <div className="absolute bottom-2 right-2 bg-green-900/90 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                        صورة الهيكل والبيئة
                      </div>
                    </div>
                    <div className="relative rounded-[2rem] overflow-hidden shadow-md border-4 border-white bg-slate-950/5 flex items-center justify-center">
                      <img src={closeImage || ''} alt="Close view" className="w-full h-full object-contain" />
                      <div className="absolute bottom-2 right-2 bg-orange-900/90 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                        صورة البؤرة المقربة
                      </div>
                    </div>
                  </div>

                  {!result.isPlant ? (
                    <motion.div 
                      className="p-10 bg-white/80 backdrop-blur-xl rounded-[3.5rem] border-2 border-amber-200 flex flex-col items-center text-center space-y-6 shadow-2xl"
                    >
                      <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center rotate-6 transform shadow-inner">
                        <Camera size={48} className="text-amber-500" />
                      </div>
                      <p className="font-black text-amber-900 text-2xl leading-loose">
                        زارعنا الأصيل، عذراً..<br/>
                        <span className="text-lg text-amber-700 font-bold block mt-3 bg-amber-100/50 p-4 rounded-2xl italic">هذه الصورة لا تنتمي لعالم النبات الجميل. يرجى تزويدي بصورة لنبتة زينة حقيقية لأتمكن من تشخيصها بدقة.</span>
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      
                      {/* Name Card */}
                      <motion.div 
                        className="bg-gradient-to-r from-emerald-600 to-green-700 p-8 rounded-[3rem] shadow-[0_20px_40px_rgba(5,150,105,0.25)] relative overflow-hidden group"
                      >
                        <div className="absolute -right-10 -bottom-10 opacity-20 hover:scale-110 transition-transform">
                          <Trees size={180} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                            <h4 className="text-white/80 text-[10px] font-black tracking-wider flex items-center gap-2">
                               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                               تشخيص زون للخدمات الزراعية
                            </h4>
                          </div>
                          <p className="text-white text-3xl font-sans font-black leading-tight">
                            {result.disease_name || result.diseaseName}
                          </p>
                          <div className="mt-3 inline-block bg-white/10 px-4 py-1 rounded-full text-xs text-yellow-300 font-black">
                             فئة التشخيص العضوية: {result.isHealthy ? 'سليم تماماً' : 'إصابة تحتاج لمكافحة'}
                          </div>
                        </div>
                      </motion.div>

                      {/* Primary Diagnosis Display */}
                      <div className="w-full">

                        {/* Plant State status card */}
                        <div className="bg-white/95 border-2 border-slate-300 p-6 rounded-[2.5rem] shadow-xl flex flex-col justify-between items-center text-center w-full">
                          <span className="text-[11px] font-black text-slate-900 uppercase block mb-2 w-full text-right tracking-wider">الحالة العامة للنظام النباتي</span>
                          
                          <div className="flex items-start gap-4 text-right w-full">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${result.isHealthy ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-orange-100 text-orange-700 border border-orange-300'}`}>
                              {result.isHealthy ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                            </div>
                            <div>
                              <h4 className="font-sans font-black text-slate-950 text-xl">
                                {result.isHealthy ? 'نبات سليم ومثالي' : result.disease_name || result.diseaseName}
                              </h4>
                              <p className="text-xs text-emerald-700 font-extrabold mt-1 leading-relaxed">الإجابات المقدمة هنا يتم توليدها عبر الذكاء الاصطناعي للإرشاد العام فقط، ولا تضمن الدقة بنسبة 100%</p>
                            </div>
                          </div>

                          <div className="border-t-2 border-slate-200/80 pt-4 mt-4 w-full text-right text-base font-black text-blue-700 leading-relaxed">
                            {result.diagnosis}
                          </div>
                        </div>

                      </div>

                      {/* Chemical and Local remedies side by side */}
                      {!result.isHealthy && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="bg-gradient-to-l from-blue-100/60 to-white p-6 rounded-[2.5rem] border-2 border-blue-300 shadow-sm text-right">
                            <h5 className="font-sans font-black text-blue-950 text-base mb-2.5 flex items-center gap-2">
                              <FlaskConical size={20} className="text-blue-700" /> 
                              <span>العلاج الكيميائي والمقاومة</span>
                            </h5>
                            <p className="text-blue-700 text-sm font-black leading-relaxed">{result.generalMedicine}</p>
                          </div>
                          
                          <div className="bg-gradient-to-l from-blue-100/60 to-white p-6 rounded-[2.5rem] border-2 border-blue-300 shadow-sm text-right">
                            <h5 className="font-sans font-black text-blue-950 text-base mb-2.5 flex items-center gap-2">
                              <LeafyGreen size={20} className="text-blue-700" /> 
                              <span>العلاج الطبيعي (الوصفة البلدية)</span>
                            </h5>
                            <p className="text-blue-700 text-sm font-black leading-relaxed">{result.localAlternative}</p>
                          </div>
                        </div>
                      )}



                      {/* Care Tips Section */}
                      {(result.care_tips || result.careTips) && (
                        <div className="space-y-6">
                          <h4 className="font-sans font-black text-slate-950 text-2xl px-2 flex items-center gap-3">
                            <div className="w-3 h-8 bg-emerald-600 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
                            <span>نصائح الإدارة والرعاية الوقائية</span>
                          </h4>
                          <div className="grid grid-cols-1 gap-5">
                            {(result.care_tips || result.careTips).map((tip: string, idx: number) => {
                              // Vivid colorful backgrounds (Blue, Bright Green, Gold/Amber) custom styled with very black text
                              const cardDesigns = [
                                {
                                  bg: "bg-blue-300 border-blue-500 hover:bg-blue-400 text-slate-950 shadow-md",
                                  iconBg: "bg-blue-800 text-white"
                                },
                                {
                                  bg: "bg-emerald-300 border-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md",
                                  iconBg: "bg-emerald-800 text-white"
                                },
                                {
                                  bg: "bg-amber-300 border-amber-500 hover:bg-amber-400 text-slate-950 shadow-md",
                                  iconBg: "bg-amber-800 text-white"
                                }
                              ];
                              const design = cardDesigns[idx % cardDesigns.length];
                              return (
                                <div 
                                  key={idx} 
                                  className={`${design.bg} border-2 p-6 rounded-[2rem] flex gap-4 items-start text-right transition-all duration-300 transform hover:scale-[1.015] hover:shadow-lg`}
                                >
                                  <div className={`w-9 h-9 ${design.iconBg} rounded-2xl flex items-center justify-center shrink-0 font-sans text-sm font-black select-none shadow-md`}>
                                    {idx + 1}
                                  </div>
                                  <p className="text-base font-black text-slate-950 leading-relaxed">🍃 {tip} 🍃</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Repeat Screening Button */}
                  <div className="pt-4">
                    <button 
                      onClick={() => { 
                        setFullImage(null); 
                        setCloseImage(null); 
                        setResult(null); 
                        setWarning(null); 
                      }} 
                      className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                      <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                      <span>فحص نبات زينة آخر</span>
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
