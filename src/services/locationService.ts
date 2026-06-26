import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

/**
 * Interface for the location result containing coordinates or an error message.
 */
export interface LocationResult {
  coords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  error?: string;
  timestamp?: number;
  isAccurate?: boolean;
}

/**
 * Service module for handling native and web geolocation using Capacitor.
 * Optimized for high accuracy (GPS) and Android integration.
 */
export const LocationService = {
  /**
   * Main function to get the current position.
   * Enforces high accuracy (GPS) and filters out approximate results (>20m).
   */
  async getCurrentLocation(retryCount = 0): Promise<LocationResult> {
    const isNative = Capacitor.isNativePlatform();
    
    // 1. Handle Permissions with Interactive Rationale
    if (isNative) {
      try {
        const perms = await Geolocation.checkPermissions();
        if (perms.location !== 'granted') {
          // Rationale: User specifically asked for this warning text
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            return { 
              error: '⚠️ نحتاج لتفعيل "الموقع الدقيق" (Fine Location) لضمان دقة النتائج وتفادي هامش خطأ قد يصل لـ 5 كيلومترات. يرجى السماح للتطبيق بالوصول للموقع بدقة عالية من إعدادات النظام.' 
            };
          }
        }
      } catch (e) {
        console.warn('Geolocation permissions error:', e);
      }
    }

    // Attempt retrieval with strict accuracy requirements
    try {
      // Priority: PRIORITY_HIGH_ACCURACY is mapped to enableHighAccuracy: true in Capacitor
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0   // Force fresh coordinates, no cache
      });

      const accuracy = pos.coords.accuracy || 1000;

      // 2. Accuracy Filtering (Try to get high accuracy, but do not block if failing)
      if (accuracy > 550) {
        if (retryCount < 2) { // Allow up to 2 fast retries to see if GPS locks better
          console.log(`Accuracy is ${accuracy}m. Retrying for better signal... Attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); 
          return this.getCurrentLocation(retryCount + 1);
        }
      }

      return this.formatResult(pos);

    } catch (e) {
      console.warn('High Accuracy retrieval failed, falling back...', e);
      
      // Fallback for Web/Browser environments
      if (!isNative && typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const res = this.formatResult(pos);
              // Resolve anyway even if accuracy represents poor coverage so they can pin manually
              resolve(res);
            },
            (err) => resolve({ error: 'عذراً، فشل تحديد الموقع التلقائي. تأكد من إعطاء متصفحك الإذن بالوصول للموقع، أو حدد موقعك يدوياً على الخريطة.' }),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      }
      
      return { error: 'يرجى تفعيل الـ GPS في إعدادات جهازك لتحديد موقعك البدئي، أو استخدام الخريطة لتحديد الموقع يدوياً.' };
    }
  },

  /**
   * Helper to format different position objects and check accuracy threshold.
   */
  formatResult(pos: Position | GeolocationPosition): LocationResult {
    const accuracy = pos.coords.accuracy || 1000;
    return {
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: accuracy
      },
      timestamp: pos.timestamp,
      isAccurate: accuracy <= 550 // Enforced threshold
    };
  }
};
