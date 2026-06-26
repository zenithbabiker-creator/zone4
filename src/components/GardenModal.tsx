import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, X, Layout, HeartPulse, Camera, Image as ImageIcon, Send 
} from 'lucide-react';

interface GardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'creation' | 'care' | null;
  setServiceType: (t: 'creation' | 'care' | null) => void;
  photo: string | null;
  setPhoto: (p: string | null) => void;
  notes: string;
  setNotes: (n: string) => void;
  onCapture: (source: 'camera' | 'album') => void;
  onOrder: () => void;
}

export const GardenModal = ({ 
  isOpen, 
  onClose, 
  serviceType, 
  setServiceType, 
  photo, 
  setPhoto, 
  notes, 
  setNotes,
  onCapture,
  onOrder 
}: GardenModalProps) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLocalNotes(notes);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        {/* Hidden inputs for file capturing - IDs needed for App.tsx fallback logic */}
        <input 
          type="file" 
          ref={fileInputRef} 
          id="garden-gallery"
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          id="garden-camera-native"
          className="hidden" 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
        />

        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative"
        >
          <div className="bg-gradient-to-r from-green-800 to-green-600 p-6 text-white text-center">
            <Sprout className="mx-auto mb-2" size={40} />
            <div className="absolute top-6 left-6">
              <button 
                onClick={onClose} 
                className="text-white/80 hover:text-white transition-colors"
                id="garden-close-btn"
              >
                <X size={24} />
              </button>
            </div>
            <h2 className="text-xl font-black">تصميم وتنسيق الحدائق</h2>
            <p className="text-white/80 text-sm italic">نحول مساحتك إلى جنة خضراء</p>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar" dir="rtl">
            {!serviceType ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setServiceType('creation')} 
                  className="flex flex-col items-center p-6 bg-green-50 rounded-2xl border-2 border-green-100 hover:border-green-500 transition-all group"
                  id="choice-creation-btn"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform"><Layout size={32} className="text-green-700" /></div>
                  <span className="font-black text-green-900">إنشاء حدائق</span>
                </button>
                <button 
                  onClick={() => setServiceType('care')} 
                  className="flex flex-col items-center p-6 bg-red-50 rounded-2xl border-2 border-red-100 hover:border-red-500 transition-all group"
                  id="choice-care-btn"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform"><HeartPulse size={32} className="text-red-700" /></div>
                  <span className="font-black text-red-900">رعاية حدائق</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-2xl shadow-sm">
                  <p className="text-green-900 text-sm font-black flex items-center gap-2 mb-1"><Camera size={18} className="text-green-600" />نرغب برؤية مساحتك الخضراء..</p>
                  <p className="text-green-700/80 text-[11px] font-bold leading-relaxed">فضلاً منك، التقط صورة مباشرة لحديقتك أو اختر صورة من المعرض لنتمكن من تقديم أفضل نصيحة وتصميم لك.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onCapture('camera')} 
                    className="bg-green-600 hover:bg-green-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-white transition-all shadow-md active:scale-95"
                    id="capture-camera-btn"
                  >
                    <Camera size={24} /><span className="text-[11px]">تصوير مباشر</span>
                  </button>
                  <button 
                    onClick={() => onCapture('album')} 
                    className="bg-white hover:bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-gray-700 transition-all border-2 border-gray-100 shadow-sm active:scale-95"
                    id="capture-album-btn"
                  >
                    <ImageIcon size={24} className="text-blue-500" /><span className="text-[11px]">من الاستوديو</span>
                  </button>
                </div>
                {photo && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-green-500 shadow-inner">
                    <img src={photo} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => setPhoto(null)} 
                      className="absolute top-2 right-2 bg-red-600/80 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      id="remove-photo-btn"
                    >
                      <X size={14}/>
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-1 mr-1">ملاحظاتك واحتياجاتك</label>
                  <textarea 
                    className="w-full bg-gray-50 rounded-xl p-4 border-2 border-transparent focus:border-green-500 transition-all outline-none min-h-[100px] text-right" 
                    placeholder="اكتب هنا ما تحتاجه حديقتك..." 
                    value={localNotes} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalNotes(val);
                      // Use a timeout to sync with parent to avoid blocking current frame
                      const timer = setTimeout(() => setNotes(val), 50);
                      return () => clearTimeout(timer);
                    }} 
                    id="garden-notes-textarea"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={onOrder} 
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    id="submit-garden-order-btn"
                  >
                    <Send size={20} /> إرسال الطلب
                  </button>
                  <button 
                    onClick={() => setServiceType(null)} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 rounded-xl transition-all"
                    id="back-service-type-btn"
                  >
                    رجوع
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
