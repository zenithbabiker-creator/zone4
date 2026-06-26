import React, { ReactNode, useState, useEffect, useRef, useMemo, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App as CapApp } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource as CapacitorCameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle as LeafletCircle } from 'react-leaflet';

// Initialize PWA elements
if (typeof window !== 'undefined') {
  defineCustomElements(window);
}
import L from 'leaflet';
import { normalize, transformDriveUrl, getIcon } from './utils';
import { GardenModal } from './components/GardenModal';
import { PlantDiagnosis as PlantDiagnosisComponent } from './components/PlantDiagnosis';
import { LocationService, LocationResult } from './services/locationService';

// Fix Leaflet icon issues in Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GLOBAL CONFIGURATION (ZONE APP ENGINE) ---
const SYSTEM_API_KEY = '';
const SYSTEM_GAS_URL = 'https://script.google.com/macros/s/AKfycbwM79ElW-MwwQW0qG5WeV5KRNqqTidI1JhL6yV-Fm9Lp3EpKzMGdlillHfCBoknfMqv/exec';
const PROD_URL = import.meta.env.VITE_PROD_URL || 'https://ais-dev-svw5ykbmqk4up2f4hyeix3-740760212521.europe-west2.run.app';

const getApiUrl = (path: string) => {
  // Check if we're on a mobile device or native platform
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (Capacitor.isNativePlatform() || isMobile) {
    return `${PROD_URL}${path}`;
  }
  return path;
};
// ----------------------------------------------

import { 
  saveProducts, 
  getProducts, 
  saveMetadata, 
  getMetadata, 
  getCachedImage, 
  cacheImage 
} from './lib/storage';
import { 
  Power, 
  Bell, 
  User, 
  FileText, 
  RefreshCw, 
  Smartphone, 
  Plus,
  Minus,
  QrCode, 
  Briefcase, 
  Users, 
  History, 
  CreditCard, 
  ClipboardList, 
  Clock, 
  Settings, 
  ShoppingCart, 
  DollarSign,
  ChevronLeft,
  Navigation,
  Lock,
  Search,
  X,
  Copy,
  CheckCircle,
  Camera,
  Upload,
  Trash2,
  Leaf,
  Info,
  LeafyGreen,
  AlertTriangle,
  Image as ImageIcon,
  Flower2,
  Trees,
  Sprout,
  Container,
  FlaskConical,
  Sun,
  Cloud,
  Grape,
  Carrot,
  Hammer,
  Wind,
  Mountain,
  Infinity,
  Bug,
  Droplets,
  Home,
  Palmtree,
  Shrub,
  Pill,
  Scissors,
  Shovel,
  Wrench,
  Package,
  Store,
  Gift,
  TreePine,
  Cherry,
  Apple,
  Banana,
  Citrus,
  Wheat,
  Waves,
  Flame,
  Zap,
  Heart,
  Star,
  Globe,
  ExternalLink,
  Compass,
  Map,
  MapPin,
  Anchor,
  Bike,
  Car,
  Plane,
  Train,
  Music,
  Video,
  Mic,
  Headphones,
  Book,
  Pen,
  Palette,
  Gamepad,
  Trophy,
  Target,
  Flag,
  Coffee,
  Utensils,
  GlassWater,
  Beer,
  Wine,
  Pizza,
  IceCream,
  Cake,
  Cookie,
  Candy,
  Egg,
  Fish,
  Bone,
  PawPrint,
  Bird,
  Rabbit,
  Turtle,
  Snail,
  Shell,
  Feather,
  Umbrella,
  Tent,
  Binoculars,
  Telescope,
  Microscope,
  Stethoscope,
  Activity,
  HeartPulse,
  Thermometer,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sunrise,
  Sunset,
  Rainbow,
  Sparkles,
  ZapOff,
  Shield,
  Key,
  LockKeyhole,
  Eye,
  EyeOff,
  Fingerprint,
  Cpu,
  HardDrive,
  Database,
  Server,
  Monitor,
  Laptop,
  Tablet,
  Printer,
  Mouse,
  Keyboard,
  Speaker,
  Tv,
  Radio,
  Cast,
  Wifi,
  Bluetooth,
  Battery,
  Plug,
  Lightbulb,
  Flashlight,
  Calculator,
  Calendar,
  Mail,
  Inbox,
  Send,
  Archive,
  HardHat,
  Construction,
  Truck,
  Bus,
  Ship,
  TramFront,
  CableCar,
  MountainSnow,
  Trees as TreesIcon,
  TreeDeciduous,
  Clover,
  Flower,
  Dna,
  Atom,
  Magnet,
  GraduationCap,
  School,
  Library,
  Church,
  Hotel,
  Hospital,
  Factory,
  Warehouse,
  ShoppingBag,
  Tag,
  Ticket,
  Wallet,
  Coins,
  Banknote,
  Receipt,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  Presentation,
  Languages,
  MessageSquare,
  MessageCircle,
  Phone,
  Video as VideoIcon,
  Share2,
  Link,
  Paperclip,
  Bookmark,
  StickyNote,
  Folder,
  File,
  Files,
  Image,
  Play,
  Pause,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  Star as StarIcon,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Ghost,
  Skull,
  Crown,
  Gem,
  Medal,
  Award,
  Badge,
  Check,
  Equal,
  Divide,
  Percent,
  Hash,
  AtSign,
  Command,
  Option,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  Move,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Scale,
  GripVertical,
  GripHorizontal,
  MoreVertical,
  MoreHorizontal,
  Layout,
  Columns,
  Rows,
  Grid,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Type as TypeIcon,
  ShieldCheck
} from 'lucide-react';

// --- Types ---

interface CSVRow {
  [key: string]: string;
}

interface UserData {
  name: string;
  fatherName: string;
  whatsapp: string;
}

interface GridItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  level: number;
  isGlossy?: boolean;
  key?: any;
}

// --- Components ---

// --- Components ---

const InitialTermsScreen = ({ onAccept }: { onAccept: () => void }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#042f22] z-[150] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
              <Shield className="text-green-700 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-green-800">اتفاقية الاستخدام</h2>
              <p className="text-[10px] font-bold text-gray-500 italic">مشتل زون - سياسة الخصوصية</p>
            </div>
          </div>
          <img src="https://i.ibb.co/qFgDcx2b/logo.png" className="w-10 h-10 object-contain opacity-20" alt="logo" />
        </div>

        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3 text-right" dir="rtl">
          <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative min-h-[300px]">
            <iframe 
              src="https://drive.google.com/file/d/1lfUVjH_DexIVj5amzgcFSaqCmWCOExaI/preview" 
              className="w-full h-full border-0"
              title="اتفاقية الاستخدام"
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-white/50 rounded-2xl"></div>
          </div>
        </div>

        <div className="p-4 bg-white flex flex-col gap-3 flex-none border-t">
          <div className="p-3 bg-green-50/50 rounded-2xl border border-green-100/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex-1 text-right">
                <span className="text-[10px] font-black text-gray-700 group-hover:text-green-700 transition-colors italic">
                  أقر بموافقتي الكاملة على كافة بنود اتفاقية الاستخدام وسياسة الخصوصية المعروضة أعلاه.
                </span>
              </div>
              <div className="relative w-7 h-7 shrink-0">
                <input 
                  type="checkbox" 
                  className="peer hidden" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="w-full h-full border-2 border-gray-300 rounded-lg bg-white peer-checked:bg-green-700 peer-checked:border-green-700 transition-all flex items-center justify-center shadow-sm">
                  <Check className="text-white w-4 h-4 opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                </div>
              </div>
            </label>
          </div>

          <button
            disabled={!agreed}
            onClick={onAccept}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              agreed 
                ? "bg-green-700 text-white hover:bg-green-800 scale-[1.01]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>دخول التطبيق</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RegistrationScreen = ({ onComplete, onShowLegal }: { onComplete: (data: UserData) => void, onShowLegal: () => void }) => {
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name && fatherName && whatsapp && agreed) {
      const data = { name, fatherName, whatsapp };
      localStorage.setItem('zone_user_data', JSON.stringify(data));
      onComplete(data);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#013220]/80 backdrop-blur-xl z-[90] flex flex-col items-center justify-start sm:justify-center overflow-y-auto p-4 sm:p-6 perspective-1000"
    >
      <motion.div 
        initial={{ rotateX: 20, y: 50, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        className="w-full max-w-md space-y-8 p-6 sm:p-8 pb-12 rounded-[3rem] border border-white/20 shadow-2xl relative overflow-hidden my-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.1)'
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none z-0"
        />

        <div className="text-center space-y-2 relative z-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-red-700 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6 border-b-4 border-red-900 overflow-hidden"
          >
             <img src="https://i.ibb.co/qFgDcx2b/logo.png" className="w-full h-full object-contain p-1 rounded-3xl" alt="logo" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">مرحباً بك في زون</h1>
          <p className="text-white/60 font-bold">يرجى إدخال بياناتك للمرة الأولى</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">الاسم بالكامل</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20"
                placeholder="أدخل اسمك..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">اسم الأب</label>
              <input 
                required
                type="text" 
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20"
                placeholder="أدخل اسم الوالد..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-2">رقم الواتساب</label>
              <input 
                required
                type="tel" 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full h-14 bg-white/5 border-2 border-white/10 rounded-2xl px-6 font-bold text-white focus:border-red-600 focus:ring-0 transition-all outline-none placeholder:text-white/20 font-mono"
                placeholder="09XXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {/* Real Checkbox UX */}
            <div className="flex items-start space-x-reverse space-x-3 w-full bg-white/5 p-4 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-colors">
              <button 
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  agreed ? 'bg-green-600 border-green-600' : 'border-white/40 bg-transparent'
                }`}
              >
                {agreed && <Check size={16} className="text-white" />}
              </button>
              <div className="text-right text-[11px] leading-relaxed select-none">
                <span className="text-white/70 font-bold">بمتابعة التسجيل، أنا أقر بأنني اطلعت وأوافق تماماً على </span>
                <button 
                  type="button"
                  onClick={onShowLegal}
                  className="text-yellow-500 font-black underline decoration-yellow-600/50 underline-offset-4 hover:text-yellow-400 transition-colors"
                >
                  اتفاقية الاستخدام وسياسة الخصوصية
                </button>
                <span className="text-white/40 block mt-1 font-bold italic">نحن نحمي بياناتك وأمان تعاملك المالي</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!agreed}
              className={`w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-black/40 flex items-center justify-center space-x-reverse space-x-3 border-b-4 transition-all ${
                agreed 
                ? 'bg-[#B71C1C] text-white border-red-900 cursor-pointer' 
                : 'bg-gray-800 text-white/10 border-gray-950 cursor-not-allowed opacity-50'
              }`}
            >
              <span>تأكيد البيانات والدخول</span>
              <ChevronLeft size={24} />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CartModal = ({ isOpen, onClose, cart, onRemove, onClearAll, onProceedToInvoice }: { isOpen: boolean, onClose: () => void, cart: any[], onRemove: (index: number) => void, onClearAll: () => void, onProceedToInvoice: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);
      return () => window.removeEventListener('zone-back-button', handleBack);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * 1000 || 0), 0);

  return (
    <div className="fixed inset-0 z-[250] bg-[#042f22] overflow-y-auto custom-scrollbar pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="min-h-screen flex flex-col relative"
      >
        {/* Sticky Header - Narrow Range */}
        <div className="sticky top-0 z-50 p-4 border-b border-white/10 bg-[#042f22]/90 backdrop-blur-xl flex justify-between items-center shadow-2xl">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="p-2 bg-red-600 rounded-xl shadow-lg relative group overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShoppingCart size={24} className="text-white" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">سلة المشتريات</h2>
              <p className="text-yellow-500/60 text-[10px] font-bold uppercase tracking-widest leading-none">Review Your Items</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-reverse space-x-3">
            {cart.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onClearAll}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-black text-xs flex items-center space-x-reverse space-x-2 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} />
                <span>إفراغ السلة</span>
              </motion.button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content Section - Scrollable with the page */}
        <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20">
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ShoppingCart size={150} className="mb-6 opacity-10" />
              </motion.div>
              <p className="text-3xl font-black text-white/40">السلة فارغة حالياً</p>
              <p className="text-lg font-bold mt-2 text-yellow-500/30">ابدأ بإضافة بعض النباتات الجميلة لبيتك</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onClose}
                className="mt-8 px-8 py-4 bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 rounded-2xl font-black"
              >
                تصفح المنتجات الآن
              </motion.button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, x: 50 }}
                      key={`${item.label}-${index}`}
                      className="flex items-center space-x-reverse space-x-4 p-4 bg-white/5 rounded-[2rem] border border-white/10 group hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
                    >
                      {/* Background Glow */}
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-600/10 blur-3xl rounded-full group-hover:bg-yellow-600/20 transition-colors" />
                      
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img 
                          src={item.image || null} 
                          alt={item.label} 
                          className="w-full h-full object-contain rounded-2xl shadow-2xl border-2 border-white/20 relative z-10 transform group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center shadow-xl border border-white/20 z-20">
                          1
                        </div>
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <h3 className="font-black text-white text-lg leading-tight mb-1 group-hover:text-yellow-500 transition-colors">{item.label}</h3>
                        <div className="flex items-center space-x-reverse space-x-2">
                          <span className="text-yellow-500 font-black text-xl drop-shadow-md">{(parseFloat(item.price) * 1000).toLocaleString()}</span>
                          <span className="text-white/30 text-[10px] font-bold">SDG</span>
                        </div>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        onClick={() => onRemove(index)}
                        className="p-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 relative z-10"
                      >
                        <Trash2 size={24} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer Section - Now part of the scrollable content */}
              <div className="mt-12 p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10 relative z-10">
                  <div className="text-center md:text-right">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] mb-2">إجمالي المبلغ المستحق</p>
                    <div className="flex items-baseline space-x-reverse space-x-3">
                      <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)]">
                        {total.toLocaleString()}
                      </span>
                      <span className="text-yellow-500/60 font-black text-2xl">SDG</span>
                    </div>
                  </div>
                  
                  <div className="h-px w-full md:w-px md:h-20 bg-white/10 hidden md:block" />
                  
                  <div className="text-center md:text-left">
                    <p className="text-white/40 text-sm font-bold mb-2 uppercase tracking-widest">ملخص السلة</p>
                    <div className="bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                      <span className="text-white font-black text-4xl">{cart.length}</span>
                      <span className="text-white/60 font-bold mr-3 text-lg">منتجات مختارة</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-reverse sm:space-x-6 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onClick={onClose}
                    className="flex-1 h-20 rounded-[1.5rem] font-black text-xl bg-white/5 text-white border border-white/10 transition-all flex items-center justify-center space-x-reverse space-x-3"
                  >
                    <ChevronLeft size={24} className="rotate-180" />
                    <span>متابعة التسوق</span>
                  </motion.button>
                  
                  <motion.button
                    disabled={cart.length === 0}
                    whileHover={cart.length > 0 ? { scale: 1.02, y: -5 } : {}}
                    onClick={onProceedToInvoice}
                    className={`flex-[2] h-20 rounded-[1.5rem] font-black text-2xl shadow-[0_25px_50px_-12px_rgba(183,28,28,0.5)] flex items-center justify-center space-x-reverse space-x-4 border-b-8 transition-all relative overflow-hidden group ${
                      cart.length > 0 
                      ? 'bg-gradient-to-r from-red-700 to-red-600 text-white border-red-900' 
                      : 'bg-white/10 text-white/20 border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-25deg]" />
                    <FileText size={32} />
                    <span>إتمام الطلب وعرض الفاتورة</span>
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};


const InvoiceModal = ({ isOpen, onClose, onProceedToPayment, cart, userData }: { isOpen: boolean, onClose: () => void, onProceedToPayment: () => void, cart: any[], userData: UserData | null }) => {
  useEffect(() => {
    if (isOpen) {
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);
      return () => window.removeEventListener('zone-back-button', handleBack);
    }
  }, [isOpen, onClose]);

  const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * 1000 || 0), 0);

  const numberToArabicWords = (n: number) => {
    // Simple implementation for common amounts, can be expanded
    const units = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
    if (n === 0) return "صفر";
    // This is a placeholder for a full library like 'number-to-arabic-words'
    // For now, we'll return a formatted string
    return `${n.toLocaleString('ar-EG')} جنيه سوداني فقط لا غير`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md perspective-1000">
      <motion.div 
        initial={{ scale: 0.8, rotateY: 15, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col border border-white/20"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none z-50"
        />
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 left-4 z-50 bg-red-600 text-white p-2 rounded-full shadow-lg">
          <X size={24} />
        </button>

        {/* Invoice Content (Template) */}
        <div className="p-8 bg-white relative min-h-[1000px] flex flex-col">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
            <img src="https://i.ibb.co/qFgDcx2b/logo.png" alt="watermark" className="w-4/5" />
          </div>

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8 relative z-10">
            <div className="text-left">
              <h1 className="text-xl font-black text-green-800 leading-tight">KILIMANJARO ZONE</h1>
              <p className="text-sm font-black text-gray-800 tracking-widest">AGRIBUSINESS</p>
            </div>
            <div className="flex flex-col items-center">
              <img src="https://i.ibb.co/qFgDcx2b/logo.png" alt="logo" className="w-16 h-16 object-contain" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-green-800">مشتل زون</h1>
              <p className="text-sm font-black text-gray-800">للأعمال الزراعية</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-8 mb-8 relative z-10 font-bold text-gray-800">
            <div className="space-y-2">
              <p><span className="text-gray-400">الاسم بالكامل:</span> {userData?.name} {userData?.fatherName}</p>
            </div>
            <div className="text-right space-y-2">
              <p><span className="text-gray-400">التاريخ:</span> {date}</p>
              <p><span className="text-gray-400">رقم الهاتف:</span> {userData?.whatsapp}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 relative z-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-y-2 border-gray-800">
                  <th className="p-4 text-right border-x border-gray-300 text-xl font-[900]">اسم المنتج</th>
                  <th className="p-4 text-center border-x border-gray-300 text-xl font-[900]">الكمية</th>
                  <th className="p-4 text-center border-x border-gray-300 text-xl font-[900]">السعر</th>
                  <th className="p-4 text-left border-x border-gray-300 text-xl font-[900]">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {/* Grouping cart items by name */}
                {Object.values(cart.reduce((acc, item) => {
                  if (!acc[item.label]) acc[item.label] = { ...item, qty: 0 };
                  acc[item.label].qty += 1;
                  return acc;
                }, {} as any)).map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="p-3 text-right font-bold">{item.label}</td>
                    <td className="p-3 text-center font-bold">{item.qty}</td>
                    <td className="p-3 text-center font-bold">{(parseFloat(item.price) * 1000).toLocaleString()}</td>
                    <td className="p-3 text-left font-bold">{(parseFloat(item.price) * 1000 * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800 bg-gray-50">
                  <td colSpan={3} className="p-4 text-right font-black text-xl">المجموع الكلي</td>
                  <td className="p-4 text-left font-black text-xl text-green-700">{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="mt-6 p-4 bg-gray-50 border-r-4 border-green-700">
              <p className="text-lg font-black text-gray-800">
                فقط: <span className="text-green-700">{numberToArabicWords(total)}</span>
              </p>
            </div>

            {/* Action Button - Moved Higher and Changed to Green */}
            <div className="mt-8 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={onProceedToPayment}
                className="w-full h-16 rounded-2xl font-black text-xl shadow-[0_20px_40px_rgba(21,128,61,0.3)] flex items-center justify-center space-x-reverse space-x-4 border-b-4 bg-gradient-to-r from-green-700 to-green-600 text-white border-green-900 transition-all"
              >
                <CreditCard size={28} />
                <span>انتقل إلى بيانات الدفع</span>
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t-2 border-gray-800 flex justify-between items-end relative z-10">
            <div className="text-xs font-black text-gray-600 space-y-1">
              <p>أم درمان - مدينة النيل</p>
              <p>0123317749 / 0900951555</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 border-4 border-blue-900 rounded-full flex items-center justify-center opacity-30 rotate-12">
                <div className="text-[10px] font-black text-blue-900 text-center uppercase">
                  مشتل زون<br/>للأعمال الزراعية<br/>2026
                </div>
              </div>
              <p className="text-[10px] font-black mt-2">الختم الرسمي</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SuccessScreen = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const petals = Array.from({ length: 20 });
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Falling Petals */}
      {petals.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`, 
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            top: '110%', 
            rotate: 360,
            opacity: [0, 1, 1, 0],
            x: [0, Math.random() * 100 - 50, 0]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute pointer-events-none"
        >
          <Flower2 size={24} className="text-pink-200/60" />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-16 px-6 text-center">
        <div /> {/* Spacer */}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 max-w-xl"
        >
          <h2 className="text-4xl font-black text-green-900 drop-shadow-sm leading-tight">
            تم توثيق طلبك بنجاح في أرشيف زون المشفر..
          </h2>
          <p className="text-2xl font-bold text-green-700/80 italic leading-relaxed">
            "شكراً لثقتك بـ (زون) واختيارك لها.. لقد استلمنا طلبك"
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(234, 179, 8, 0.6)' }}
          onClick={onBackToHome}
          className="w-full max-w-md py-6 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-red-900 rounded-2xl font-black text-2xl shadow-[0_10px_50px_rgba(234,179,8,0.4)] flex items-center justify-center space-x-reverse space-x-4 border-b-4 border-yellow-800 relative overflow-hidden group"
        >
          {/* Radiant Glow Effect */}
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-200/20 blur-xl"
          />
          <Home size={32} className="relative z-10" />
          <span className="relative z-10">العودة للشاشة الرئيسية</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const PaymentModal = ({ isOpen, onClose, userData, cart, onSuccess, gardenPhoto, gardenNotes }: { isOpen: boolean, onClose: () => void, userData: UserData | null, cart: any[], onSuccess: () => void, gardenPhoto: string | null, gardenNotes: string }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(null);
  const [initialGpsPos, setInitialGpsPos] = useState<[number, number] | null>(null);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState(18);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('satellite'); 
  const [accuracyWarning, setAccuracyWarning] = useState<string | null>("جاري جلب موقعك بدقة GPS عالية... يرجى الانتظار.");
  const [gpsLoading, setGpsLoading] = useState(true);
  const [showDistancePrompt, setShowDistancePrompt] = useState(false);
  const [isDistanceConfirmed, setIsDistanceConfirmed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const receiptContentRef = useRef<HTMLDivElement>(null);
  const invoiceContentRef = useRef<HTMLDivElement>(null);
  const gardenContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReceipt(null); // Clear previous receipt to prevent reuse
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);

      const fetchInitialLoc = async () => {
        setGpsLoading(true);
        setAccuracyWarning("جاري جلب أقصى إشارة GPS ممكنة... يرجى الوقوف في مكان مفتوح.");
        
        try {
          const loc = await LocationService.getCurrentLocation();
          
          if (loc.coords) {
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            const acc = loc.coords.accuracy || 1000;
            
            if (!initialGpsPos) setInitialGpsPos([lat, lng]);
            setMarkerPos([lat, lng]);
            setCurrentLocation(loc);
            setGpsLoading(false);
            setMapZoom(19); // Max street precision

            if (acc <= 15) {
              setAccuracyWarning("تم جلب موقعك بدقة عالية. من فضلك، حرك الخريطة وضع الدبوس (Pin) بالضبط أمام بوابة منزلك لضمان وصول المندوب.");
            } else if (acc <= 35) {
              setAccuracyWarning("تم تحديد الموقع. يرجى سحب الدبوس ووضعه بدقة أمام بوابة منزلك تماماً.");
            } else {
              setAccuracyWarning("دقة إشارة الـ GPS ضعيفة؛ ننصحك باستخدام (نمط القمر الصناعي) ووضع الدبوس يدوياً أمام بوابة منزلك.");
              setMapMode('satellite');
            }
          } else {
            setGpsLoading(false);
            setAccuracyWarning(loc.error || "فشل جلب الموقع تلقائياً. من فضلك ابحث عن منزلك على الخريطة وضع الدبوس أمام البوابة.");
          }
        } catch (error) {
          setGpsLoading(false);
          setAccuracyWarning("حدث خطأ أثناء جلب الموقع. يرجى تحديد موقعك يدوياً على الخريطة.");
        }
      };
      
      fetchInitialLoc();

      return () => window.removeEventListener('zone-back-button', handleBack);
    } else {
      setMarkerPos(null);
      setGpsLoading(true);
    }
  }, [isOpen]);

  const handleManualMapUpdate = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setMapZoom(19); // STREET PRECISION
    setAccuracyWarning(null);
    setCurrentLocation({
      coords: { latitude: lat, longitude: lng, accuracy: 0 },
      isAccurate: true,
      timestamp: Date.now()
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("1297423");
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateSecurePDF = async () => {
    if (!userData || !receipt || !markerPos) return;

    // Logic Check: If pin is > 550m from initial GPS, require confirmation
    if (initialGpsPos && !isDistanceConfirmed) {
      const distance = getDistance(initialGpsPos[0], initialGpsPos[1], markerPos[0], markerPos[1]);
      if (distance > 550) {
        setShowDistancePrompt(true);
        return;
      }
    }
    
    setIsGenerating(true);
    try {
      // Ensure images are loaded and layout is stable
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      // 1. Capture Map Section (Page 1)
      if (mapContentRef.current) {
        const canvas = await html2canvas(mapContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
        
        if (markerPos) {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${markerPos[0]},${markerPos[1]}`;
          // Link overlay on the map image area (approx)
          pdf.link(24, 70, 160, 80, { url: mapsUrl });
        }
      }

      // 2. Capture Receipt Section (Page 2)
      if (receiptContentRef.current) {
        pdf.addPage();
        const canvas = await html2canvas(receiptContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
      }

      // 3. Capture Invoice Section (Page 3+)
      if (invoiceContentRef.current) {
        const canvas = await html2canvas(invoiceContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const totalHeight = (canvas.height * pdfWidth) / canvas.width;
        let currentPosition = 0;
        
        while (currentPosition < totalHeight) {
          pdf.addPage();
          pdf.addImage(
            imgData, 
            'JPEG', 
            0, 
            -currentPosition, 
            pdfWidth, 
            totalHeight,
            undefined,
            'FAST'
          );
          currentPosition += pdfPageHeight;
        }
      }

      // 4. Capture Garden Section (If exists)
      if ((gardenPhoto || gardenNotes) && gardenContentRef.current) {
        pdf.addPage();
        const canvas = await html2canvas(gardenContentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfPageHeight), undefined, 'FAST');
      }
      
      // Set Metadata
      pdf.setProperties({
        title: 'Zone Invoice & Payment Proof',
        subject: 'Secure Archiving',
        author: 'Zone Agribusiness',
        creator: 'Zone App'
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${userData.name}_${userData.fatherName}_${dateStr}-${userData.whatsapp}.pdf`.replace(/\s+/g, '_');
      
      if (userData && fileName) {
        // --- 1. SEND TO MANAGEMENT (GOOGLE DRIVE) ---
        // Prepare PDF for Google Apps Script
        const pdfBase64 = pdf.output('datauristring').split(',')[1];
        
        try {
          // Standard fetch with redirection support (gas usually redirects)
          const response = await fetch(SYSTEM_GAS_URL, {
            method: 'POST',
            mode: 'no-cors', // Standard for GAS simple POST if no custom headers needed
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdfBase64,
              fileName,
              action: 'management_backup',
              clientName: `${userData.name} ${userData.fatherName}`,
              phone: userData.whatsapp,
              timestamp: new Date().toISOString(),
              gardenNotes: gardenNotes || "",
              gardenPhoto: gardenPhoto ? "Check attached PDF for image" : "No image attached"
            })
          });
          
          console.log("PDF delivery signaled to Administration Gateway.");
        } catch (err) {
          console.error("Critical: Management sync failed:", err);
        }

        // --- 2. HANDLE LOCAL DOWNLOAD (MOBILE / WEB) ---
        if (Capacitor.isNativePlatform()) {
          const base64Data = pdf.output('datauristring').split(',')[1];
          try {
            // Write to local filesystem for user access
            await Filesystem.writeFile({
              path: `Zone_${fileName}`,
              data: base64Data,
              directory: Directory.Documents,
              recursive: true
            });
            
            // Notification of success instead of Share sheet (which includes WhatsApp)
            console.log("PDF Saved locally to Documents folder.");
          } catch (err) {
            console.error("Native file process failed:", err);
            // Fallback
            pdf.save(fileName);
          }
        } else {
          // Web fallback
          pdf.save(fileName);
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePickReceipt = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Explicitly check and request permissions for native platforms
        const status = await CapacitorCamera.checkPermissions();
        
        if (status.camera !== 'granted' || (status.photos !== 'granted' && status.photos !== 'limited')) {
          const request = await CapacitorCamera.requestPermissions({
            permissions: ['camera', 'photos']
          });
          
          if (request.camera !== 'granted' || (request.photos !== 'granted' && request.photos !== 'limited')) {
            console.error('Permission denied for camera or photos');
            // We could show a toast or alert here, but simple rejection for now
            return;
          }
        }

        const photo = await CapacitorCamera.getPhoto({
          quality: 60,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CapacitorCameraSource.Prompt,
          promptLabelHeader: 'إرفاق إشعار بنكك',
          promptLabelPhoto: 'اختيار من الاستوديو',
          promptLabelPicture: 'التقاط صورة بنكك',
          width: 1000
        });
        
        if (photo.dataUrl) {
          // Process the image for consistency
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1600;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
              setReceipt(compressedBase64);
            }
          };
          img.src = photo.dataUrl;
        }
      } catch (err) {
        console.warn('Camera/Gallery selection cancelled or failed:', err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setReceipt(compressedBase64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="w-full h-full overflow-y-auto relative custom-scrollbar flex flex-col"
        style={{
          background: 'rgba(10, 46, 31, 1)',
        }}
      >
        {/* Shine Effect */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] pointer-events-none z-0"
        />
        {/* Floral Frame Decoration - Removed problematic top-left image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="https://picsum.photos/seed/flowers2/200/200" className="absolute -bottom-10 -right-10 w-40 h-40 opacity-40 -rotate-12" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 border-[20px] border-transparent border-t-yellow-600/10 border-b-yellow-600/10 opacity-20" />
        </div>

        <div className="p-8 relative z-10 flex flex-col items-center flex-1 justify-center max-w-2xl mx-auto w-full">
          <button onClick={onClose} className="absolute top-8 left-8 text-white/60 hover:text-white bg-white/10 p-3 rounded-full">
            <X size={32} />
          </button>

          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-600/50">
              <CreditCard size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">تحديث بيانات الدفع</h2>
            <p className="text-yellow-500/80 text-sm font-bold">يرجى تحويل المبلغ للحساب أدناه</p>
          </div>

          {/* Account Details - Royal Presentation */}
          <div className="w-full bg-black/40 p-8 rounded-[2rem] border-2 border-yellow-600/20 shadow-inner mb-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-transparent to-yellow-600/20 rounded-[2rem] blur-sm opacity-50" />
            
            <div className="relative space-y-6 text-center">
              <div className="space-y-1">
                <p className="text-xs font-black text-yellow-600/60 uppercase tracking-[0.3em]">اسم الحساب</p>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] italic font-serif">
                  Mazin Mustafa
                </h3>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/30 to-transparent" />

              <div className="space-y-1">
                <p className="text-xs font-black text-yellow-600/60 uppercase tracking-[0.3em]">رقم الحساب</p>
                <div className="flex items-center justify-center space-x-reverse space-x-4">
                  <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest">
                    1297423
                  </h3>
                  
                  {/* Inflatable Copy Button */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={handleCopy}
                      className="p-3 bg-yellow-600 text-red-900 rounded-2xl shadow-lg relative"
                    >
                      <Copy size={20} />
                      <AnimatePresence>
                        {isCopying && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: -40, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-xl"
                          >
                            تم النسخ!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <p className="text-[10px] font-black mt-2 text-yellow-500/80 animate-pulse">
                      {isCopying ? "تم نسخ رقم بنك بامان" : "اضغط لنسخ رقم بنك بامان"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Selection Section */}
          <div className="w-full space-y-4">
            <div className="bg-black/40 p-4 rounded-3xl border-2 border-yellow-600/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
              
              <div className="bg-blue-600/30 border-2 border-blue-400 p-5 rounded-2xl mb-4 flex items-start space-x-reverse space-x-4 shadow-[0_0_30px_rgba(37,99,235,0.2)] backdrop-blur-md relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0 border-2 border-white/20 animate-pulse">
                  <Map className="text-white" size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-base font-black leading-tight">تنبيه حاسم لضمان التوصيل:</p>
                  <p className="text-blue-100 text-xs font-bold leading-relaxed">
                    المندوب سيصل بالضبط إلى مكان "الدبوس الأحمر". يرجى وضعه <span className="text-yellow-400 underline font-black">(أمام باب منزلك تماماً)</span>. ننصح باستخدام "نمط القمر الصناعي" للتأكد من المنزل.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-right">
                  <h4 className="text-white font-black text-lg flex items-center space-x-reverse space-x-2">
                    <Globe size={20} className={mapMode === 'satellite' ? 'text-blue-400 animate-pulse' : 'text-yellow-500'} />
                    <span>تحديد نقطة "أمام باب المنزل"</span>
                  </h4>
                  <p className="text-yellow-500/60 text-[10px] font-bold">حرك الدبوس فوق بابك (استخدم صور الأقمار الصناعية)</p>
                </div>
                {markerPos && markerPos.length === 2 && (
                   <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                     <span className="text-green-500 text-[10px] font-black tracking-widest font-mono">
                       {markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}
                     </span>
                   </div>
                )}
              </div>

              {/* Interactive Map */}
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border-2 border-white/20 relative z-0 shadow-inner bg-gray-900 group">
                {markerPos ? (
                  <MapContainer center={markerPos} zoom={mapZoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    {mapMode === 'standard' ? (
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                    ) : (
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                      />
                    )}
                    <MapController center={markerPos} zoom={mapZoom} />
                    <MapEvents onMapClick={handleManualMapUpdate} />
                    {currentLocation?.coords?.accuracy && markerPos && (
                      <LeafletCircle
                        center={markerPos}
                        radius={currentLocation.coords.accuracy}
                        pathOptions={{ 
                          fillColor: '#3b82f6', 
                          fillOpacity: 0.15, 
                          color: '#3b82f6',
                          weight: 1,
                          dashArray: '5, 5'
                        }}
                      />
                    )}
                    {markerPos && markerPos.length === 2 && (
                      <Marker 
                        position={markerPos} 
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const pos = marker.getLatLng();
                            handleManualMapUpdate(pos.lat, pos.lng);
                          },
                        }}
                      />
                    )}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mb-6"
                    />
                    <p className="text-white font-black text-xl mb-2">جاري تحديد الموقع بدقة فدائية...</p>
                    {currentLocation?.coords?.accuracy && (
                      <p className="text-white/60 text-xs mt-2 italic font-bold">
                        * معامل الخطأ المسموح به 550 متراً لضمان دقة "أمام البوابة".
                      </p>
                    )}
                    
                    {!gpsLoading && (
                      <button 
                        onClick={async () => {
                          setAccuracyWarning("جاري جلب موقعك بدقة فدائية...");
                          const loc = await LocationService.getCurrentLocation();
                          if (loc.coords) {
                            handleManualMapUpdate(loc.coords.latitude, loc.coords.longitude);
                            setCurrentLocation(loc); // Ensure current location state is updated for circle rendering
                            setAccuracyWarning("تم جلب الموقع بنجاح. فضلاً، اسحب الدبوس فوق بابك تماماً.");
                          } else {
                            // Neutral Sudan center if everything fails, but zoom out 
                            handleManualMapUpdate(15.0, 30.0);
                            setMapZoom(6);
                            setAccuracyWarning(loc.error || "تعذر جلب الموقع. تم فتح الخريطة؛ يرجى البحث عن منزلك يدوياً.");
                          }
                        }}
                        className="mt-6 bg-yellow-500 text-black px-8 py-3 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        اضغط لفتح الخريطة يدوياً
                      </button>
                    )}
                  </div>
                )}

                {/* Accuracy Pulse Layer - Custom Visual Feedback */}
                {markerPos && (
                  <div className="absolute inset-0 pointer-events-none z-[401] flex items-center justify-center">
                      <div className="relative">
                         {/* Center Indicator */}
                         <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_#fbbf24]" />
                         {/* Pulsing ring proportional to accuracy */}
                         {currentLocation?.coords?.accuracy && (
                           <motion.div 
                             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400 rounded-full"
                             style={{ 
                               width: `${Math.max(20, Math.min(200, currentLocation.coords.accuracy * 2))}px`, 
                               height: `${Math.max(20, Math.min(200, currentLocation.coords.accuracy * 2))}px` 
                             }}
                           />
                         )}
                      </div>
                  </div>
                )}
                {/* Floating Instruction Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 pointer-events-none z-[402]">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-500/50 shadow-2xl"
                   >
                     <p className="text-white text-[10px] font-black whitespace-nowrap flex items-center space-x-reverse space-x-2">
                        <MapPin size={14} className="text-red-500 animate-bounce" />
                        <span>ضع الدبوس أمام باب منزلك تماماً</span>
                     </p>
                   </motion.div>
                </div>

                {/* Custom Map Controls */}
                <div className="absolute top-4 left-4 z-[400] flex flex-col space-y-3">
                  {/* Zoom Controls */}
                  <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <button 
                      onClick={() => setMapZoom(prev => Math.min(prev + 1, 19))}
                      className="p-3 hover:bg-gray-100 text-black border-b border-gray-100 flex items-center justify-center"
                    >
                      <Plus size={20} className="font-black" />
                    </button>
                    <button 
                      onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
                      className="p-3 hover:bg-gray-100 text-black flex items-center justify-center"
                    >
                      <Minus size={20} className="font-black" />
                    </button>
                  </div>

                  <button
                    onClick={() => setMapMode(mapMode === 'standard' ? 'satellite' : 'standard')}
                    className={`flex items-center space-x-reverse space-x-2 px-4 py-2 rounded-xl border-2 transition-all ${
                      mapMode === 'satellite' 
                      ? 'bg-blue-600 text-white border-blue-400' 
                      : 'bg-white text-gray-800 border-gray-300'
                    } shadow-xl font-bold`}
                  >
                    <Globe size={18} />
                    <span className="text-xs">{mapMode === 'satellite' ? 'نمط القمر الصناعي' : 'نمط الخريطة (ينصح بالقمر الصناعي)'}</span>
                  </button>
                  
                  <button
                    onClick={async () => {
                      setAccuracyWarning("جاري تحديث موقعك بدقة عالية...");
                      const loc = await LocationService.getCurrentLocation();
                      if (loc.coords) {
                        setMarkerPos([loc.coords.latitude, loc.coords.longitude]);
                        setCurrentLocation(loc);
                        setMapZoom(19);
                        setAccuracyWarning("تم تحديث الموقع بنجاح. ضعه أمام الباب.");
                      } else if (loc.error) {
                        setAccuracyWarning(loc.error);
                      } else {
                        setAccuracyWarning("تعذر جلب الموقع. يرجى المحاولة مرة أخرى.");
                      }
                    }}
                    className="bg-yellow-500 text-black px-3 py-2 rounded-xl border border-black/20 text-[10px] font-black flex items-center space-x-reverse space-x-2 shadow-2xl hover:scale-105 transition-all"
                  >
                    <Navigation size={14} className="animate-pulse" />
                    <span>تحديد موقعي الآن</span>
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 z-[400] flex flex-col space-y-3 items-end">
                    {/* Accuracy Status Capsule */}
                    {currentLocation?.coords?.accuracy !== undefined && (
                      <div className={`backdrop-blur-md px-4 py-2 rounded-full border shadow-lg mb-2 flex items-center space-x-reverse space-x-3 transition-all ${
                        currentLocation.coords.accuracy <= 10 
                        ? 'bg-green-600/80 border-green-400' 
                        : currentLocation.coords.accuracy <= 30
                        ? 'bg-yellow-600/80 border-yellow-400'
                        : 'bg-red-600/80 border-red-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full animate-ping ${
                          currentLocation.coords.accuracy <= 10 ? 'bg-green-300' : 'bg-yellow-300'
                        }`} />
                        <p className="text-[11px] text-white font-black">
                          {currentLocation.coords.accuracy <= 10 
                            ? `دقة فائقة: ${Math.round(currentLocation.coords.accuracy)} متر (مثالي)` 
                            : currentLocation.coords.accuracy <= 30
                            ? `دقة جيدة: ${Math.round(currentLocation.coords.accuracy)} متر`
                            : `تحذير: دقة ضعيفة (${Math.round(currentLocation.coords.accuracy)} م)`}
                        </p>
                      </div>
                    )}

                  <button
                    onClick={async () => {
                      setAccuracyWarning("جاري البحث عن موقعك...");
                      const loc = await LocationService.getCurrentLocation();
                      if (loc.coords) {
                        handleManualMapUpdate(loc.coords.latitude, loc.coords.longitude);
                      } else if (loc.error) {
                        setAccuracyWarning(loc.error);
                      }
                    }}
                    className="bg-white text-black p-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-4 border-yellow-600 hover:bg-yellow-50 transition-all flex items-center"
                  >
                    <Compass size={32} className="text-yellow-600" />
                  </button>
                </div>
              </div>

              {accuracyWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-blue-600/20 border border-blue-600/50 rounded-xl flex items-start space-x-reverse space-x-3"
                >
                  <MapPin className="text-blue-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-blue-400 text-[10px] font-black leading-relaxed">
                    {accuracyWarning}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={handlePickReceipt}
              className={`w-full h-40 rounded-3xl border-4 border-dashed transition-all flex flex-col items-center justify-center space-y-4 group relative overflow-hidden cursor-pointer z-10 ${
                receipt ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden"
              />
              
              {receipt ? (
                <>
                  <div className="absolute inset-0">
                    <img src={receipt} className="w-full h-full object-cover opacity-20" alt="receipt-preview" />
                  </div>
                  <CheckCircle size="12vw" className="text-green-500 relative z-10" />
                  <span className="text-green-500 font-black text-lg relative z-10">تم إرفاق الإشعار بنجاح</span>
                </>
              ) : (
                <>
                  <div className="flex space-x-reverse space-x-4">
                    <Camera size="12vw" className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                    <Upload size="12vw" className="text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-white font-black text-xl group-hover:text-yellow-400 transition-colors">ارفق اشعار بنكك</span>
                    <span className="text-yellow-500/80 font-bold text-sm">بنفس قيمة الفاتورة</span>
                  </div>
                </>
              )}
            </motion.div>

            <motion.button
              disabled={!receipt || isGenerating || !markerPos}
              onClick={generateSecurePDF}
              className={`w-full h-16 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center space-x-reverse space-x-3 ${
                receipt && !isGenerating && markerPos
                ? 'bg-red-600 text-white border-b-4 border-red-900' 
                : 'bg-gray-700 text-white/30 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin" size={24} />
              ) : (
                <>
                  <span>تأكيد عملية الدفع والأرشفة</span>
                  <ChevronLeft size={24} />
                </>
              )}
            </motion.button>
            
            {!markerPos && (
              <p className="mt-4 text-yellow-500 text-[12px] font-black text-center bg-yellow-500/10 py-3 rounded-xl border border-yellow-500/30">
                ⚠️ يرجى تحديد موقعك يدوياً على الخريطة (فوق باب منزلك) لتتمكن من المتابعة
              </p>
            )}
          </div>
        </div>

        {/* Hidden PDF Templates Section */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none z-[-100]">
          {/* Page 1: Map / Geolocation Template */}
          <div ref={mapContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#065f46' }}>KILIMANJARO ZONE</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937', letterSpacing: '0.1em' }}>AGRIBUSINESS</p>
              </div>
              <img src="https://i.ibb.co/qFgDcx2b/logo.png" alt="logo" style={{ width: '80px', height: '80px' }} />
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#065f46' }}>مشتل زون</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937' }}>للأعمال الزراعية</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
               <p>العميل: {userData?.name} {userData?.fatherName}</p>
               <p style={{ textAlign: 'right' }}>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>

            {markerPos && (
              <div style={{ padding: '24px', backgroundColor: '#f0f9ff', border: '3px solid #0369a1', borderRadius: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: '#0369a1' }} />
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0369a1', marginBottom: '20px', textAlign: 'center' }}>التوثيق الجغرافي (بروتوكول الدقة فائقـة):</h3>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={`https://static-maps.yandex.ru/1.x/?ll=${markerPos[1]},${markerPos[0]}&z=18&l=sat&size=450,450&pt=${markerPos[1]},${markerPos[0]},pm2rdl`} 
                    alt="Map"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('z=16')) {
                        // Try lower zoom first
                        target.src = `https://static-maps.yandex.ru/1.x/?ll=${markerPos[1]},${markerPos[0]}&z=16&l=sat&size=450,450&pt=${markerPos[1]},${markerPos[0]},pm2rdl`;
                      } else {
                        // Final fallback to a generic location image or hide
                        target.src = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=450&auto=format&fit=crop";
                        target.style.opacity = '0.5';
                      }
                    }}
                    style={{ width: '300px', height: '300px', borderRadius: '12px', border: '3px solid #0369a1' }}
                  />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '2px solid #bae6fd', marginBottom: '20px' }}>
                      <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>إحداثيات التوصيل المعتمدة:</p>
                      <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#0c4a6e', fontFamily: 'monospace' }}>
                        {markerPos[0].toFixed(6)}<br/>{markerPos[1].toFixed(6)}
                      </p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#0369a1', borderRadius: '12px', color: '#ffffff', fontWeight: '999', fontSize: '18px' }}>
                      رابط خرائط جوجل مفعل
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: '20px', fontSize: '14px', color: '#334155', textAlign: 'center', fontWeight: '900' }}>
                   تم تحديد الموقع يدوياً من قبل العميل لضمان الوصول لباب المنزل بدقة 1 متر.
                </p>
              </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#64748b' }}>هذه الصفحة مخصصة لغرفة عمليات التوصيل - نظام زون الذكي</p>
            </div>
          </div>

          {/* Page 2: Bank Receipt Template */}
          <div ref={receiptContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ width: '100%', border: '8px solid #f3f4f6', borderRadius: '24px', overflow: 'hidden' }}>
              {receipt ? <img src={receipt} style={{ width: '100%', height: 'auto' }} alt="receipt" /> : null}
            </div>
            
            {/* Small Footer for receipt page */}
            <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>تابع لمشتل زون لخدمات الحدائق - إشعار دفع مؤكد</p>
              <p style={{ fontSize: '10px' }}>تم إرفاق هذا الإشعار من قبل العميل كوثيقة دفع</p>
            </div>
          </div>

          {/* Page 3+: Full Invoice Template */}
          <div ref={invoiceContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#065f46' }}>KILIMANJARO ZONE</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937', letterSpacing: '0.1em' }}>AGRIBUSINESS</p>
              </div>
              <img src="https://i.ibb.co/qFgDcx2b/logo.png" alt="logo" style={{ width: '80px', height: '80px' }} />
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#065f46' }}>مشتل زون</h1>
                <p style={{ fontSize: '14px', fontWeight: '900', color: '#1f2937' }}>للأعمال الزراعية</p>
              </div>
            </div>

            <div style={{ marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
              <p>فاتورة مبيعات للعميل: {userData?.name} {userData?.fatherName}</p>
              <p>الرقم التعريفي: {userData?.whatsapp}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderTop: '4px solid #1f2937', borderBottom: '4px solid #1f2937' }}>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '20px', fontWeight: '900' }}>المنتج</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '20px', fontWeight: '900' }}>الكمية</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '20px', fontWeight: '900' }}>السعر</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '20px', fontWeight: '900' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(cart.reduce((acc, item) => {
                  if (!acc[item.label]) acc[item.label] = { ...item, qty: 0 };
                  acc[item.label].qty += 1;
                  return acc;
                }, {} as any)).map((item: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '2px solid #e5e7eb', fontSize: '18px' }}>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>{item.label}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{(parseFloat(item.price) * 1000).toLocaleString()}</td>
                    <td style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>{(parseFloat(item.price) * 1000 * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '4px solid #1f2937', backgroundColor: '#f9fafb' }}>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'right', fontWeight: '900', fontSize: '24px' }}>المجموع النهائي</td>
                  <td style={{ padding: '24px', textAlign: 'left', fontWeight: '900', fontSize: '24px', color: '#047857' }}>
                    {(cart.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0) * 1000).toLocaleString()} SDG
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '4px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#4b5563' }}>
                <p>تم الإصدار بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                <p>أم درمان - مدينة النيل</p>
                <p>0123317749 / 0900951555</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', border: '6px solid rgba(6, 95, 70, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '999', color: 'rgba(6, 95, 70, 0.4)', textAlign: 'center' }}>KILIMANJARO<br/>OFFICIAL</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: '900' }}>الختم الإلكتروني المعتمد</p>
              </div>
            </div>
          </div>

          {/* Page 4: Garden Design Data Template (Hidden) */}
          <div ref={gardenContentRef} style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
            <div style={{ borderBottom: '4px solid #065f46', paddingBottom: '20px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#065f46' }}>تفاصيل طلب تنسيق الحدائق</h2>
              <p style={{ fontSize: '14px', color: '#666' }}>مرفقات إضافية خاصة بالطلب</p>
            </div>

            {gardenPhoto && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1f2937', marginBottom: '15px' }}>صور الحديقة الحالية:</h3>
                <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                  <img src={gardenPhoto} style={{ width: '100%', height: 'auto' }} alt="Garden Layout" />
                </div>
              </div>
            )}

            {gardenNotes && (
              <div style={{ padding: '25px', backgroundColor: '#f0fdf4', borderRadius: '15px', border: '2px solid #bbf7d0' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#166534', marginBottom: '10px' }}>ملاحظات العميل:</h3>
                <p style={{ fontSize: '18px', color: '#14532d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {gardenNotes}
                </p>
              </div>
            )}

            <div style={{ marginTop: '50px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              <p>تم إرسال هذه المرفقات كجزء من عملية الأرشفة الذكية لنظام زون</p>
            </div>

            {/* Distance Error Logic Check Modal */}
            <AnimatePresence>
              {showDistancePrompt && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 sm:p-0">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowDistancePrompt(false)}
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-gray-900 border-2 border-yellow-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.3)] z-[1101]"
                  >
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-yellow-500/50">
                      <AlertTriangle className="text-yellow-500" size={32} />
                    </div>
                    
                    <h3 className="text-xl font-black text-white text-center mb-4 leading-relaxed">
                      تنبيه هام من نظام الـ GPS
                    </h3>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl mb-8">
                      <p className="text-yellow-100 text-sm font-bold text-center leading-relaxed">
                        الدبوس الذي وضعته بعيد جداً (أكثر من 550 متر) عن إشارة الـ GPS الحالية. هل أنت متأكد أن الدبوس يقع <span className="text-yellow-400 underline underline-offset-4">بالضبط أمام بوابة منزلك</span>؟
                      </p>
                    </div>

                    <div className="space-y-4">
                       <button 
                         onClick={() => {
                           setIsDistanceConfirmed(true);
                           setShowDistancePrompt(false);
                           // Trigger the PDF generation again now that it's confirmed
                           setTimeout(() => generateSecurePDF(), 300);
                         }}
                         className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black shadow-xl flex items-center justify-center gap-3 transition-colors"
                       >
                         <CheckCircle size={20} />
                         <span>نعم، هذا هو موقع البوابة بدقة</span>
                       </button>

                       <button 
                         onClick={() => setShowDistancePrompt(false)}
                         className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-black border border-white/10 transition-colors"
                       >
                         تعديل موضع الدبوس مرة أخرى
                       </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CachedImage = ({ src, alt, className, style, referrerPolicy }: { src: string, alt: string, className?: string, style?: any, referrerPolicy?: any }) => {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      if (!src || src.trim() === "") return;
      
      // Try to get from cache first
      const cached = await getCachedImage(src);
      if (cached && isMounted) {
        setDisplaySrc(cached);
        return;
      }

      // If not in cache, fetch and store
      try {
        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        await cacheImage(src, blob);
        const localUrl = URL.createObjectURL(blob);
        if (isMounted) setDisplaySrc(localUrl);
      } catch (error) {
        // Silently fail for caching errors to avoid console noise for users
        // This usually happens due to CORS restrictions on external images
        if (isMounted) setDisplaySrc(src); 
      }
    };

    loadImage();
    return () => { isMounted = false; };
  }, [src]);

  const finalSrc = displaySrc || src || "https://picsum.photos/seed/plant/800/800";

  if (!finalSrc || finalSrc.trim() === "") return null;

  return (
    <motion.img 
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.8 }}
      src={Capacitor.convertFileSrc(finalSrc)} 
      alt={alt} 
      className={className}
      style={style}
      referrerPolicy={referrerPolicy}
    />
  );
};

const ProductCard = ({ name, price, image, onAddToCart, onImageClick }: { name: string, price: string, image: string, onAddToCart: () => void, onImageClick?: (img: string) => void, key?: any }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chargeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 2000); 
    onAddToCart();
  };

  const startCharging = () => {
    chargeTimer.current = setTimeout(() => {
      setIsCharging(true);
    }, 500); // Start showing charging effect after 0.5s
  };

  const stopCharging = () => {
    if (chargeTimer.current) clearTimeout(chargeTimer.current);
    setIsCharging(false);
  };

  return (
    <motion.div 
      onPointerDown={startCharging}
      onPointerUp={stopCharging}
      onPointerLeave={stopCharging}
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      whileHover={{ rotateY: 5, rotateX: 2, y: -10 }}
      viewport={{ once: true }}
      animate={isCharging ? { scale: 0.98, rotateX: -5 } : { scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="relative w-full h-[55vh] sm:h-[80vh] rounded-[2.5rem] overflow-hidden flex flex-col group cursor-pointer perspective-1000 preserve-3d"
      style={{
        background: 'rgba(6, 78, 59, 0.45)',
        backdropFilter: 'blur(25px)',
        boxShadow: isCharging 
          ? '0 80px 120px -20px rgba(16, 185, 129, 0.5), inset 0 0 30px rgba(255,255,255,0.2)' 
          : '0 40px 80px -15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255,255,255,0.05)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}
    >
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
      
      {/* Light Shoulders (Glow at corners) */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${isCharging ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#10B981]/40 to-transparent blur-2xl transition-all duration-500 ${isCharging ? 'scale-150 blur-3xl' : 'scale-100'}`} />
        <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#10B981]/40 to-transparent blur-2xl transition-all duration-500 ${isCharging ? 'scale-150 blur-3xl' : 'scale-100'}`} />
      </div>

      {/* Shine/Lustre Effect */}
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none z-10"
      />

      {/* Image Layer (70%) - Carved/Rising effect */}
      <div className="relative h-[70%] w-full flex items-center justify-center p-3 shrink-0">
          <motion.div 
            className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative group/img cursor-zoom-in"
            whileHover={{ scale: 1.04, rotate: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onImageClick) onImageClick(image);
            }}
          >
            <CachedImage 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-110 group-hover/img:brightness-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.4)] pointer-events-none" />
          </motion.div>
      </div>

      {/* Info Section (30%) - Distinct Elevation */}
      <div className="flex-1 px-5 pb-5 pt-1 flex flex-col justify-between relative z-20 overflow-hidden bg-black/5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] line-clamp-1">
            {name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse-slow">
              {(parseFloat(price) * 1000).toLocaleString()}
            </span>
            <span className="text-[9px] font-black text-[#FFD700]/70 uppercase tracking-widest">SDG</span>
          </div>
        </div>

        {/* High-Elevation 3D Emerald Button */}
        <div className="relative mt-auto pt-1">
          <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={handleAdd}
            className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all duration-500 flex items-center justify-center space-x-reverse space-x-2 shadow-[0_20px_40px_rgba(6,78,59,0.5)] border-b-4 border-[#043a2c] relative z-10 overflow-hidden ${
              isFlashing 
              ? 'bg-white text-[#064E3B] shadow-[0_0_40px_rgba(16,185,129,1)]' 
              : 'bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white'
            }`}
          >
            <ShoppingCart size={16} className={isFlashing ? 'animate-bounce' : ''} />
            <span className="transition-all duration-300">
              {isFlashing ? 'تمت إضافة المنتج بنجاح' : 'إضافة إلى السلة'}
            </span>
            
            {/* Glow effect */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/40 blur-3xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Deep Shadow for 3D effect */}
          <div className="absolute -bottom-2 left-4 right-4 h-8 bg-black/40 blur-2xl rounded-full -z-10" />
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedButton = ({ icon, label, onClick, level, isGlossy }: GridItemProps) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
    
    // Call onClick immediately but let the visual feedback happen
    // Reduced delay for better responsiveness on mobile
    setTimeout(() => {
      onClick();
    }, 50); 
  };

  const flashColor = level >= 4 ? 'bg-[#39FF14]' : 'bg-white';
  const glowColor = level >= 4 ? 'shadow-[0_0_25px_rgba(57,255,20,0.9)]' : 'shadow-[0_0_15px_rgba(255,255,255,0.4)]';

  const isLevel2 = level === 2;
  
  // Glossy Test Dimensions
  const buttonWidth = isGlossy ? 'w-[28vw]' : (isLevel2 ? 'w-[40vw]' : 'w-[25vw]');
  const buttonHeight = isGlossy ? 'h-[28vw]' : (isLevel2 ? 'h-[22vw]' : 'h-[25vw]');
  const borderRadius = isGlossy ? 'rounded-[16px]' : (isLevel2 ? 'rounded-xl' : 'rounded-2xl');

  if (isGlossy) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 group cursor-pointer w-full z-10">
        <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
        
        <motion.div 
          onClick={handleClick}
          className={`relative ${buttonWidth} ${buttonHeight} ${borderRadius} overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center`}
          style={{
            background: 'linear-gradient(to bottom, #E30613, #9E040D)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)'
          }}
        >
          {/* Glossy Overlay (Top Half) */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 bg-white/25 pointer-events-none"
            style={{
              borderRadius: '16px 16px 50% 50% / 16px 16px 15% 15%'
            }}
          />

          {/* Icon - Centered in top half area but visually balanced */}
          <div className="text-white relative z-10 scale-[1.2] mb-2">
            {icon}
          </div>

          <AnimatePresence>
            {isFlashing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/40"
                transition={{ duration: 0.1 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Text Label */}
        <span className="text-[3.5vw] font-bold text-[#4A4A4A] text-center leading-tight px-1">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3 group cursor-pointer w-full z-10">
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />
      
      <motion.div 
        onClick={handleClick}
        className={`relative ${buttonWidth} ${buttonHeight} bg-gradient-to-b from-red-500 to-red-700 ${borderRadius} flex items-center justify-center shadow-xl border-b-[6px] border-red-900 active:border-b-0 overflow-hidden ${glowColor}`}
      >
        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-20 ${flashColor}`}
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>

        <motion.div 
          className="absolute inset-1 border-2 border-white/10 rounded-xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="text-white relative z-10">
          {icon}
        </div>
      </motion.div>

      {/* Enhanced Banner Label */}
      <div className="relative w-full flex justify-center mt-2">
        <div className="w-full h-auto min-h-[6vw] flex items-center justify-center bg-transparent">
          <span className="text-[4.5vw] font-[900] text-gray-900 text-center leading-none px-1 break-words w-full drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifications }: { isOpen: boolean, onClose: () => void, notifications: any[] }) => {
  useEffect(() => {
    if (isOpen) {
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);
      return () => window.removeEventListener('zone-back-button', handleBack);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        className="w-full max-w-lg bg-[#f0f4f0] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-t-8 border-[#064e3b] relative"
      >
        {/* Ornate Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#064e3b]/5 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#064e3b]/5 rounded-tr-full pointer-events-none" />

        <div className="bg-[#064e3b] p-8 text-white flex justify-between items-center relative overflow-hidden">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center space-x-reverse space-x-4 z-10"
          >
            <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg ring-4 ring-yellow-500/30">
              <Bell className="text-emerald-950" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">التنبيهات الإدارية</h2>
              <p className="text-yellow-500/60 text-[10px] uppercase font-black tracking-[0.2em]">Official Notifications</p>
            </div>
          </motion.div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/20 rounded-full transition-all bg-white/10 z-10"
          >
            <X size={24} />
          </button>
          
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"
          />
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar relative">
          {notifications.map((note, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15, type: 'spring' }}
              style={{ backgroundColor: note.bg, color: note.color }}
              className="p-8 rounded-[2rem] border-2 border-black/5 relative overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
            >
              {/* Ornate Leaf Decorations */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flower2 size={60} strokeWidth={1} />
              </div>
              <div className="absolute bottom-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sprout size={60} strokeWidth={1} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-reverse space-x-3 mb-4 opacity-60">
                  <Clock size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">تنبيه رقم {notifications.length - idx}</span>
                </div>
                <p className="text-xl font-black leading-loose text-right whitespace-pre-wrap drop-shadow-sm italic">
                  {note.text}
                </p>
              </div>
              
              {/* Ornate Corner Accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-current opacity-20" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-current opacity-20" />
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-[#064e3b]/5 rounded-full flex items-center justify-center mb-6">
                <Bell size={64} className="text-[#064e3b]/20" />
              </div>
              <p className="font-black text-2xl text-[#064e3b]/40">لا توجد تنبيهات حالياً</p>
              <p className="text-emerald-900/40 text-sm font-bold mt-2">ستظهر الرسائل المهمة هنا فور وصولها</p>
            </div>
          )}
        </div>
        
        <div className="bg-[#064e3b]/5 p-6 text-center border-t border-[#064e3b]/10">
          <p className="text-[#064e3b]/60 text-xs font-black uppercase tracking-widest">زون للخدمات الزراعيه</p>
        </div>
      </motion.div>
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Handle Audio Logic
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      
      const fadeOut = setTimeout(() => {
        if (audioRef.current) {
          const interval = setInterval(() => {
            if (audioRef.current && audioRef.current.volume > 0.1) {
              audioRef.current.volume -= 0.1;
            } else {
              clearInterval(interval);
            }
          }, 100);
        }
      }, 2500);
      
      // Cleanup fadeOut if component unmounts
      return () => clearTimeout(fadeOut);
    }
  }, []);

  useEffect(() => {
    // 2. CRITICAL: Handle Transition Logic (Independent of Audio)
    const timer = setTimeout(() => {
      console.log("Transitioning to main screen...");
      onComplete();
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#042f22] flex items-center justify-center overflow-hidden z-[100]">
      <audio ref={audioRef} src="https://docs.google.com/uc?export=download&id=11-PcQTJ8WG1jUPIZl2aHjViIDh13l9Lv" />

      {/* Core Logo Enclosed in a simple Circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          scale: { duration: 0.8, ease: "easeOut" },
          opacity: { duration: 0.5 }
        }}
        className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center rounded-full bg-white shadow-2xl p-0 overflow-hidden"
      >
        <img 
          src="https://i.ibb.co/qFgDcx2b/logo.png" 
          alt="Zone Logo"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          style={{ clipPath: 'circle(50%)' }}
        />
      </motion.div>
    </div>
  );
};

// --- API CONFIGURATION ---
// Refactored to server-side diagnosis
// -------------------------

const PlantDiagnosis = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return <PlantDiagnosisComponent isOpen={isOpen} onClose={onClose} />;
};

const AboutModal = ({ isOpen, onClose, onShowPrivacy }: { isOpen: boolean, onClose: () => void, onShowPrivacy: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);
      return () => window.removeEventListener('zone-back-button', handleBack);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[350] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-[3rem] w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Artistic Decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-50 rounded-full -ml-16 -mt-16 opacity-50" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mb-12 opacity-50" />

            <div className="p-8 text-center relative z-10">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl mx-auto flex items-center justify-center mb-6 border-2 border-red-50 p-4">
                <img src="https://i.ibb.co/qFgDcx2b/logo.png" className="w-full h-full object-contain" alt="about-logo" />
              </div>
              
              <h2 className="text-2xl font-black text-red-800 mb-2">مشتل زون</h2>
              <div className="h-1.5 w-12 bg-red-600 mx-auto rounded-full mb-6" />
              
              <div className="text-right space-y-4" dir="rtl">
                <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                  "مشتل زون" هو تطبيقك الزراعي المتكامل في السودان. نحن نجمع بين شغف الزراعة وتقنيات الذكاء الاصطناعي لنوفر لك أفضل أنواع الشتلات، بذور الزينة، وتصاميم اللاندسكيب، مع خدمة "طبيب النبات" الفريدة للتشخيص الفوري.
                </p>
                
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="text-red-700 w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-black text-gray-800">سياسة الخصوصية</h4>
                    <p className="text-[9px] font-bold text-gray-500">بياناتك محمية وفق أعلى المعايير</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onShowPrivacy();
                  }}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  <FileText size={18} className="group-hover:scale-110 transition-transform" />
                  <span>سياسة الخصوصية وشروط الاستخدام</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                >
                  الرجوع للتطبيق
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 tracking-[0.2em]">ZONE VERSION 2.5</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LegalModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      const handleBack = () => onClose();
      window.addEventListener('zone-back-button', handleBack);
      return () => window.removeEventListener('zone-back-button', handleBack);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[95vh] max-h-[920px]"
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-none">
          <div className="flex items-center space-x-reverse space-x-3">
            <ShieldCheck className="text-green-700" size={24} />
            <h2 className="text-lg font-black text-gray-900">الاتفاقية والخصوصية</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-900">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4 text-right flex flex-col" dir="rtl">
          <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-inner mb-4">
            <iframe 
              src="https://drive.google.com/file/d/1lfUVjH_DexIVj5amzgcFSaqCmWCOExaI/preview" 
              className="w-full h-full border-0"
              title="اتفاقية الاستخدام"
            />
          </div>

          <div className="bg-gray-100 p-4 rounded-2xl text-center border border-gray-200 flex-none">
            <p className="text-[10px] text-gray-400 font-black mb-1">المستند القانوني المعتمد من Google Drive</p>
            <button 
              onClick={() => window.open('https://drive.google.com/file/d/1lfUVjH_DexIVj5amzgcFSaqCmWCOExaI/view?usp=drive_link', '_blank')}
              className="text-[9px] font-black text-green-700 underline flex items-center justify-center gap-1 mx-auto"
            >
              <ExternalLink size={10} />
              رابط المستند الأصلي
            </button>
          </div>
        </div>
        <button onClick={onClose} className="mx-6 mb-6 h-14 bg-green-700 text-white rounded-xl font-black shadow-xl flex-none active:scale-95 transition-transform">موافق، إغلاق</button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [footerLine1, setFooterLine1] = useState<string | null>(null);
  const [footerLine2, setFooterLine2] = useState<string | null>(null);
  


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Arrow keys from potentially triggering unintended navigation if requested
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target as HTMLElement;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    // Handle Android Back Button
    const setupBackButton = async () => {
      if (Capacitor.isNativePlatform()) {
        const { App: CapacitorApp } = await import('@capacitor/app');
        CapacitorApp.addListener('backButton', () => {
          // If any modal is open, close it. Otherwise, prompt to exit (standard behavior)
          // We'll closing based on state in the actual component logic or just provide a hook
          window.dispatchEvent(new CustomEvent('zone-back-button'));
        });
      }
    };
    setupBackButton();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [data, setData] = useState<CSVRow[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [filters, setFilters] = useState<string[]>([]);
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastActiveParentId = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [isCartInflating, setIsCartInflating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [showCartHint, setShowCartHint] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isGardenSectionOpen, setIsGardenSectionOpen] = useState(false);
  const [gardenServiceType, setGardenServiceType] = useState<'creation' | 'care' | null>(null);
  const [gardenNotes, setGardenNotes] = useState('');
  const [gardenPhoto, setGardenPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalBack = () => {
      if (isGardenSectionOpen) setIsGardenSectionOpen(false);
      else if (currentLevel > 1) setCurrentLevel(1);
    };
    window.addEventListener('zone-back-button', handleGlobalBack);
    return () => window.removeEventListener('zone-back-button', handleGlobalBack);
  }, [isGardenSectionOpen, currentLevel]);

  const handleGardenCapture = async (source: 'camera' | 'album') => {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissions = await CapacitorCamera.checkPermissions();
        if (source === 'camera' && permissions.camera !== 'granted') {
          const req = await CapacitorCamera.requestPermissions();
          if (req.camera !== 'granted') return;
        }
        const image = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: source === 'camera' ? CapacitorCameraSource.Camera : CapacitorCameraSource.Photos
        });
        if (image.dataUrl) setGardenPhoto(image.dataUrl);
      } catch (e) { console.error(e); }
    } else {
      if (source === 'camera') {
        document.getElementById('garden-camera-native')?.click();
      } else {
        document.getElementById('garden-gallery')?.click();
      }
    }
  };

  const handleGardenOrder = () => {
    const serviceTitle = gardenServiceType === 'creation' ? 'طلب إنشاء وتصميم حديقة' : 'طلب رعاية وتنسيق حديقة';
    const gardenServiceItem = {
      id: `garden-${Date.now()}`,
      name: serviceTitle,
      price: "0.000",
      image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop",
      isService: true
    };
    setCart([...cart, gardenServiceItem]);
    setIsGardenSectionOpen(false);
    setIsCartDrawerOpen(true);
    setShowCartHint(true);
  };

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isProductView = (currentLevel >= 3) || (searchQuery.trim() !== '');

  const paidApiKey = useMemo(() => {
    if (data.length === 0) return null;
    const keys = Object.keys(data[0]);
    if (keys.length < 9) return null;
    const i2Value = data[0][keys[8]]; 
    return i2Value && i2Value.toString().trim().startsWith('sk-or-v1-') ? i2Value.toString().trim() : null;
  }, [data]);

  const [openRouterKey, setOpenRouterKey] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastViewedCount, setLastViewedCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('zone_viewed_notifications') || '0');
  });
  
  useEffect(() => {
    if (!showSplash && notifications.length > 0) {
      const hasShown = sessionStorage.getItem('zone_notified_this_session');
      if (!hasShown) {
        const timer = setTimeout(() => {
          setIsNotificationOpen(true);
          sessionStorage.setItem('zone_notified_this_session', 'true');
          const closeTimer = setTimeout(() => {
            setIsNotificationOpen(false);
          }, 5000);
          return () => clearTimeout(closeTimer);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [showSplash, notifications.length]);

  useEffect(() => {
    if (isNotificationOpen && notifications.length > lastViewedCount) {
      setLastViewedCount(notifications.length);
      localStorage.setItem('zone_viewed_notifications', notifications.length.toString());
    }
  }, [isNotificationOpen, notifications.length, lastViewedCount]);

  // Shortcut Logic: Jump to product if match found
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const normalizedQuery = normalize(searchQuery);
      
      // Search in the entire dataset (Column 1)
      const match = data.find(row => {
        const keys = Object.keys(row);
        const name = row[keys[0]] || '';
        const normalizedName = normalize(name);
        return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
      });

      if (match) {
        const keys = Object.keys(match);
        const colC = keys[2];
        const colD = keys[3];
        if (match[colC] && match[colD]) {
          // If we are not already at this level or category, jump to it
          if (currentLevel !== 3 || filters[0] !== match[colC] || filters[1] !== match[colD]) {
            setFilters([match[colC], match[colD]]);
            setCurrentLevel(3);
          }
        }
      }
    }
  }, [searchQuery, data]);

  const drumLockAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (cart.length > 0 && !isCartDrawerOpen && !isInvoiceOpen) {
      const timer = setTimeout(() => setShowCartHint(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCartHint(false);
    }
  }, [cart.length, isCartDrawerOpen, isInvoiceOpen]);

  useEffect(() => {
    // Check for existing user data
    const savedUserData = localStorage.getItem('zone_user_data');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }

    // استرجاع مفتاح OpenRouter المحفوظ
    const savedKey = localStorage.getItem('custom_openrouter_key');
    if (savedKey) setOpenRouterKey(savedKey);

    const fetchData = async (force: boolean = false) => {
      try {
        // 1. Load from Local Storage (IndexedDB) first for instant UI
        const cachedProducts = await getProducts();
        if (cachedProducts.length > 0) {
          setData(cachedProducts);
          setLoading(false); // Show UI immediately if we have data
          console.log("Loaded data from local storage (IndexedDB) - Showing UI while syncing.");
        }

        // 2. Check if we've already performed a sync check in this session
        const sessionSynced = sessionStorage.getItem('zone_sheets_synced');
        if (!force && sessionSynced === 'true' && cachedProducts.length > 0) {
          console.log("Already synced with Sheets in this session. Skipping network check.");
          setLoading(false);
          return;
        }

        // 3. Check for changes in Google Sheets via GAS (Professional Fetching)
        try {
          if (!navigator.onLine && cachedProducts.length > 0) {
            setLoading(false);
            return;
          }

          const lastVersion = await getMetadata('data_version');
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for check
          
          let response;
          const timestamp = Date.now();
          const checkUrl = `${SYSTEM_GAS_URL}?action=check&v=${lastVersion || '0'}&t=${timestamp}`;

          try {
            response = await fetch(checkUrl, {
              method: 'GET',
              mode: 'cors',
              redirect: 'follow',
              signal: controller.signal
            });
          } catch (e) {
            if (cachedProducts.length > 0) {
              setLoading(false);
              return;
            }
            throw e;
          }
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            if (cachedProducts.length > 0) {
              setLoading(false);
              return;
            }
            throw new Error(`ERR_SERVER_RESPONSE: ${response.status}`);
          }
          
          const checkResult = await response.json();

          sessionStorage.setItem('zone_sheets_synced', 'true');

          // If server says no change, and we have cache, stop here
          if (checkResult && checkResult.changed === false && cachedProducts.length > 0) {
            setLoading(false);
            return;
          }

          // Fetch full data if changed or no cache
          const fullController = new AbortController();
          const fullTimeoutId = setTimeout(() => fullController.abort(), 60000); 

          let fullResponse;
          const fullDataUrl = `${SYSTEM_GAS_URL}${SYSTEM_GAS_URL.includes('?') ? '&' : '?'}t=${timestamp}`;

          try {
            fullResponse = await fetch(fullDataUrl, {
              method: 'GET',
              mode: 'cors',
              redirect: 'follow',
              signal: fullController.signal
            });
          } catch (e) {
            if (cachedProducts.length > 0) {
              setLoading(false);
              return;
            }
            throw e;
          }
          clearTimeout(fullTimeoutId);
          
          if (!fullResponse.ok) {
            if (cachedProducts.length > 0) {
              setLoading(false);
              return;
            }
            throw new Error(`ERR_DATA_FETCH: ${fullResponse.status}`);
          }
          const jsonData = await fullResponse.json();

          // الاستخراج المخصص من العمود H (Index 7)
          //jsonData[row][col]
          if (Array.isArray(jsonData)) {
            // الخلية 1 (Row 1): الموقع الإلكتروني
            if (jsonData[0] && jsonData[0][7]) {
              const url = jsonData[0][7].toString().trim();
              if (url.startsWith('http')) setWebsiteUrl(url);
            }
            // الخلية 2 (Row 2): نص التذييل 1
            if (jsonData[1] && jsonData[1][7]) {
              setFooterLine1(jsonData[1][7].toString().trim());
            }
            // سحب مفتاح OpenRouter من الخلية I2 فقط إذا لم يكن موجوداً بالتخزين المحلي للهاتف
            if (jsonData[1] && jsonData[1][8]) {
              const key = jsonData[1][8].toString().trim();
              if (key && key.length > 5) {
                const existingKey = localStorage.getItem('custom_openrouter_key');
                if (!existingKey) {
                  setOpenRouterKey(key);
                  localStorage.setItem('custom_openrouter_key', key);
                } else {
                  setOpenRouterKey(existingKey);
                }
              }
            }
            // الخلية 3 (Row 3): نص التذييل 2
            if (jsonData[2] && jsonData[2][7]) {
              setFooterLine2(jsonData[2][7].toString().trim());
            }

            // الخلايا من 5 إلى 10 (Rows 5-10): التنبيهات
            // Indices 4 to 9
            const extractedNotifications = jsonData
              .slice(4, 10)
              .filter(row => row[7] && row[7].toString().trim() !== '')
              .map((row, idx) => ({
                id: `notify-${idx}-${Date.now()}`,
                text: row[7].toString().trim(),
                bg: row[8] || '#fef3c7',
                color: '#78350f'
              }));
            setNotifications(extractedNotifications);

            // ميزة التنبيه الفوري من الخلية H7 (Row 7, Column H)
            // ملاحظة: الخلية H7 هي Row Index 6
            if (jsonData[6] && jsonData[6][7]) {
              const h7Alert = jsonData[6][7].toString().trim();
              if (h7Alert && h7Alert !== "" && h7Alert !== "تنبيه") {
                setNotification({
                  message: h7Alert,
                  type: 'info'
                });
                // إغلاق التنبيه تلقائياً بعد 10 ثوانٍ
                setTimeout(() => setNotification(null), 10000);
              }
            }
          }

          // --- دالة التحليل الذكي والمتقدم للبيانات (Advanced Robust Parsing) ---
          const parsePlantData = (raw: any): any[] => {
            if (!Array.isArray(raw)) return [];
            if (raw.length === 0) return [];

            // إذا كانت البيانات مصفوفة متداخلة List<List<any>>
            if (Array.isArray(raw[0])) {
              const processed: any[] = [];
              raw.forEach((row, idx) => {
                try {
                  if (!Array.isArray(row)) return;

                  // المؤشر 0: الاسم (تخطي إذا كان فارغاً)
                  const name = row[0] ? row[0].toString().trim() : "";
                  if (!name) return;

                  // المؤشر 1: السعر (تحويل النصوص الفارغة أو غير الرقمية إلى 0)
                  let priceVal = row[1] !== undefined && row[1] !== null ? row[1].toString().trim() : "0";
                  // تنظيف السعر لاستخراج الأرقام فقط
                  const priceClean = priceVal.replace(/[^0-9.]/g, '');
                  const price = priceClean === "" ? "0" : priceClean;

                  // بناء الكائن بمفاتيح ثابتة تماشياً مع منطق التطبيق
                  processed.push({
                    "اسم_المنتج": name,
                    "السعر": price,
                    "التصنيف_الرئيسي": row[2] ? row[2].toString().trim() : "",
                    "التصنيف_الفرعي": row[3] ? row[3].toString().trim() : "",
                    "رابط_الصورة_1": row[4] ? transformDriveUrl(row[4].toString()) : "",
                    "رابط_الصورة_2": row[5] ? transformDriveUrl(row[5].toString()) : "",
                    "رابط_خارجي": row[6] ? transformDriveUrl(row[6].toString()) : "",
                    "تنبيه": row[7] ? row[7].toString().trim() : "",
                    "لون_الخلفية": row[8] ? row[8].toString().trim() : "",
                    "معرف_فريد": `plant-${idx}`
                  });
                } catch (e) {
                  console.warn(`Row ${idx} failed to parse:`, e);
                }
              });
              return processed;
            }

            // إذا كانت البيانات كائنات بالفعل، نقوم فقط بتنظيف الروابط والأسعار
            return raw.map(item => {
              const keys = Object.keys(item);
              return {
                ...item,
                [keys[1]]: item[keys[1]]?.toString().replace(/[^0-9.]/g, '') || "0",
                [keys[4]]: item[keys[4]] ? transformDriveUrl(item[keys[4]].toString()) : "",
                [keys[5]]: item[keys[5]] ? transformDriveUrl(item[keys[5]].toString()) : "",
                [keys[6]]: item[keys[6]] ? transformDriveUrl(item[keys[6]].toString()) : "",
              };
            });
          };

          const finalData = parsePlantData(jsonData);

          const currentHash = JSON.stringify(finalData).length.toString();

          if (lastVersion && currentHash === lastVersion && cachedProducts.length > 0) {
             setLoading(false);
             return;
          }

          setData(finalData);
          await saveProducts(finalData);
          await saveMetadata('data_version', currentHash);
          
          setLoading(false);
          console.log("GAS: Database synced and parsed successfully.");

          // التخزين المؤقت للصور (Background Tasks)
          finalData.forEach((product: any) => {
            const keys = Object.keys(product);
            const imageUrl = product[keys[6]] || product[keys[5]] || product[keys[4]];
            if (imageUrl) {
              (async () => {
                try {
                  const cached = await getCachedImage(imageUrl);
                  if (!cached) {
                    const imgRes = await fetch(imageUrl, { mode: 'cors' });
                    if (imgRes.ok) {
                      const blob = await imgRes.blob();
                      await cacheImage(imageUrl, blob);
                    }
                  }
                } catch (e) { /* silent fail for assets */ }
              })();
            }
          });
        } catch (fetchError: any) {
          console.error("Zone Sync Error:", fetchError);
          
          let userMessage = "حدث خطأ غير متوقع في مزامنة البيانات";
          const isTimeout = fetchError.name === 'AbortError' || 
                            fetchError.message?.toLowerCase().includes('timeout') || 
                            fetchError.message?.toLowerCase().includes('aborted');
          
          if (isTimeout) {
            userMessage = "انتهت مهلة المزامنة. جاري العمل بالبيانات المحفوظة.";
          } else if (fetchError.message?.includes('Failed to fetch')) {
            userMessage = "تعذر الاتصال بالخادم. جاري عرض البيانات المحفوظة محلياً.";
          }

          // إذا كان لدينا بيانات مخزنة، لا نزعج المستخدم بإشعارات متكررة إلا إذا كانت فادحة
          if (cachedProducts.length > 0) {
            console.warn("GAS Sync failed, using cache:", userMessage);
            setNetworkError(null); 
            // Only show notification if it was a forced refresh (not implemented yet, but good practice)
          } else {
            setNetworkError(userMessage);
            setNotification({ message: userMessage, type: 'error' });
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in data synchronization:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    
    setNotification({
      message: "تم حذف المنتج من السلة",
      type: 'info'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const clearCart = () => {
    setCart([]);
    setIsLocked(false);
    setNotification({
      message: "تم إفراغ السلة بنجاح",
      type: 'info'
    });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasAccepted = localStorage.getItem('zone_terms_accepted') === 'true';
    
    if (!hasAccepted) {
      setShowTerms(true);
    } else {
      const savedData = localStorage.getItem('zone_user_data');
      if (!savedData) {
        setShowRegistration(true);
      }
    }
  };

  const handleTermsAccepted = () => {
    localStorage.setItem('zone_terms_accepted', 'true');
    setShowTerms(false);
    const savedData = localStorage.getItem('zone_user_data');
    if (!savedData) {
      setShowRegistration(true);
    }
  };

  const handleRegistrationComplete = (data: UserData) => {
    setUserData(data);
    setShowRegistration(false);
  };

  const addToCart = (item: any) => {
    const newCart = [...cart, item];
    setCart(newCart);
    setIsCartInflating(true);
    setTimeout(() => setIsCartInflating(false), 500);

    setNotification({
      message: "تمت إضافة المنتج بنجاح. يمكنك مراجعة، تعديل، أو حذف محتويات السلة الآن.",
      type: 'success'
    });
    // Clear success notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => prev?.type === 'success' ? null : prev);
    }, 3000);
  };

  useEffect(() => {
    const fetchLevelData = async () => {
      if (data.length === 0) return;

      const parentId = filters.length > 0 ? filters[filters.length - 1] : "root";
      
      // Step 2: Strict ID Binding & Level Verification
      // Ensure currentLevel matches filters length + 1
      if (currentLevel !== filters.length + 1) {
        console.warn("Navigation state mismatch, synchronizing...");
        setCurrentLevel(filters.length + 1);
        return;
      }

      if (parentId === lastActiveParentId.current && activeItems.length > 0) return;

      // Step 1: Clear-on-Entry
      setIsTransitioning(true);
      setActiveItems([]);
      
      // We update the ref ONLY when we are sure we are starting a new data load
      lastActiveParentId.current = parentId;

      // Small delay for clean UI transition and to prevent race conditions on mobile
      const delay = setTimeout(() => {
        // Double check level hasn't changed during the delay
        if (currentLevel !== filters.length + 1) return;

        const keys = Object.keys(data[0]);
        const colC = keys[2] || 'C';
        const colD = keys[3] || 'D';
        const colA = keys[0] || 'A';
        const colB = keys[1] || 'B';
        const colE = keys[4] || 'E';
        const colF = keys[5] || 'F';
        const colG = keys[6] || 'G';

        const getProductImage = (row: any) => {
          const imgG = transformDriveUrl(row[colG]);
          const imgF = transformDriveUrl(row[colF]);
          const imgE = transformDriveUrl(row[colE]);
          return imgG || imgF || imgE || "";
        };

        let items: any[] = [];
        if (currentLevel === 1) {
          const unique = Array.from(new Set(data.map(row => row[colC]).filter(val => val && val !== 'عام')));
          items = unique.map(val => ({ type: 'level1', label: val, id: `cat-${val}` }));
          items.unshift({ type: 'static', label: 'تصميم الحدائق', id: 'garden-design' });
        } else if (currentLevel === 2) {
          const filtered = data.filter(row => row[colC] === filters[0]);
          const unique = Array.from(new Set(filtered.map(row => row[colD]).filter(val => val && val !== 'عام')));
          const hasEmptySubCategory = filtered.some(row => !row[colD] || String(row[colD]).trim() === '');
          items = unique.map(val => ({ type: 'level2', label: val, id: `subcat-${val}` }));
          if (hasEmptySubCategory && !unique.includes(filters[0])) {
            items.push({ type: 'level2', label: filters[0], id: `repeat-${filters[0]}` });
          }
        } else {
          const products = data.filter(row => {
            const matchCat = row[colC] === filters[0];
            const isRepeated = filters[1] === filters[0];
            const matchSub = isRepeated 
              ? (!row[colD] || String(row[colD]).trim() === '' || row[colD] === filters[1])
              : row[colD] === filters[1];
            return matchCat && matchSub;
          });
          items = products.map((product, i) => ({ 
            type: 'product',
            label: product[colA] || product[colD] || product[colC] || "نبات نادر", 
            id: `product-${i}-${product[colA]}`,
            price: product[colB] || "0",
            image: getProductImage(product)
          }));
        }

        setActiveItems(items);
        setIsTransitioning(false);
      }, 200);

      return () => clearTimeout(delay);
    };

    fetchLevelData();
  }, [filters, currentLevel, data]);

  // Filtering Logic (Simplified to use activeItems and Search)
  const currentItems = useMemo(() => {
    if (searchQuery.trim() !== '' && data.length > 0) {
      const normalizedQuery = normalize(searchQuery);
      const keys = Object.keys(data[0]);
      const colA = keys[0] || 'A';
      const colB = keys[1] || 'B';
      const colD = keys[3] || 'D';
      
      return data.map((product, i) => ({ 
        type: 'product',
        label: product[colA] || product[colD] || "نبات نادر", 
        id: `product-search-${i}`,
        price: product[colB] || "0",
        image: transformDriveUrl(product[keys[6]] || product[keys[5]] || product[keys[4]])
      })).filter(item => 
        normalize(item.label).startsWith(normalizedQuery) || 
        normalize(item.label).includes(normalizedQuery)
      );
    }
    return activeItems;
  }, [activeItems, searchQuery, data]);

  const handleItemClick = (label: string) => {
    // Prevent navigation if already transitioning or if filters and level are out of sync
    if (isTransitioning) return;

    // Force transition state immediately
    setIsTransitioning(true);
    setActiveItems([]); // Clear current items for clean entry
    
    // Use functional updates to ensure consistency
    setFilters(prev => {
      const nextFilters = [...prev, label];
      setCurrentLevel(nextFilters.length + 1);
      return nextFilters;
    });
    setSearchQuery(''); 
  };

  const goBack = () => {
    // Prevent navigation if already at root
    if (currentLevel <= 1) return;

    // Force transition state immediately
    setIsTransitioning(true);
    setActiveItems([]); 

    setFilters(prev => {
      const nextFilters = prev.slice(0, -1);
      setCurrentLevel(nextFilters.length + 1);
      return nextFilters;
    });
    setSearchQuery(''); 
  };

  // Handle Android/Native Back Button Navigation
  useEffect(() => {
    const backButtonHandler = async () => {
      if (zoomedImage) {
        setZoomedImage(null);
        return;
      }
      if (isPaymentOpen) {
        setIsPaymentOpen(false);
        return;
      }
      if (isInvoiceOpen) {
        setIsInvoiceOpen(false);
        return;
      }
      if (isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
        return;
      }
      if (isGardenSectionOpen) {
        // If in service sub-view, go back to service selection, else close modal
        if (gardenServiceType) {
          setGardenServiceType(null);
        } else {
          setIsGardenSectionOpen(false);
        }
        return;
      }
      if (isDiagnosisOpen) {
        setIsDiagnosisOpen(false);
        return;
      }
      if (isLegalOpen) {
        setIsLegalOpen(false);
        return;
      }
      if (isAboutOpen) {
        setIsAboutOpen(false);
        return;
      }
      if (isNotificationOpen) {
        setIsNotificationOpen(false);
        return;
      }
      if (showTerms) {
        setShowTerms(false);
        return;
      }
      if (showRegistration) {
        setShowRegistration(false);
        return;
      }
      if (currentLevel > 1) {
        goBack();
        return;
      }
      
      // If we reach here, we are at the root level with no modals open
      // We can either prompt "Confirm Exit" or let Capacitor close the app
      // By NOT preventing default here, Capacitor will handle exit automatically if it's the only listener
      // However, usually we want to confirm.
      if (window.confirm("هل تريد الخروج من التطبيق؟")) {
        CapApp.exitApp();
      }
    };

    const registration = CapApp.addListener('backButton', ({ canGoBack }) => {
      // If any modal or nested level is active, handle it and prevent exit
      const hasOverlay = !!(zoomedImage || isPaymentOpen || isInvoiceOpen || isCartDrawerOpen || isGardenSectionOpen || isDiagnosisOpen || isLegalOpen || isAboutOpen || isNotificationOpen || showTerms || showRegistration || currentLevel > 1);
      
      if (hasOverlay) {
        backButtonHandler();
      } else {
        // For the root level, we can either let it exit directly or show our confirmation
        backButtonHandler();
      }
    });

    return () => {
      registration.then(r => r.remove());
    };
  }, [zoomedImage, isPaymentOpen, isInvoiceOpen, isCartDrawerOpen, isGardenSectionOpen, gardenServiceType, isDiagnosisOpen, isLegalOpen, isAboutOpen, isNotificationOpen, showTerms, showRegistration, currentLevel]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden relative" dir="rtl">
      <audio ref={drumLockAudio} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" />
      
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTerms && (
          <InitialTermsScreen onAccept={handleTermsAccepted} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegistration && (
          <RegistrationScreen 
            onComplete={handleRegistrationComplete} 
            onShowLegal={() => setIsLegalOpen(true)}
          />
        )}
      </AnimatePresence>

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        onProceedToPayment={() => {
          setIsInvoiceOpen(false);
          setIsPaymentOpen(true);
        }}
        cart={cart} 
        userData={userData} 
      />

      <CartModal
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onClearAll={clearCart}
        onProceedToInvoice={() => {
          setIsCartDrawerOpen(false);
          setIsInvoiceOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        userData={userData}
        cart={cart}
        gardenPhoto={gardenPhoto}
        gardenNotes={gardenNotes}
        onSuccess={() => {
          setIsPaymentOpen(false);
          setShowSuccess(true);
          setCart([]);
          setGardenPhoto(null);
          setGardenNotes('');
          setGardenServiceType(null);
          setIsLocked(false);
        }}
      />

      {showSuccess && (
        <SuccessScreen onBackToHome={() => setShowSuccess(false)} />
      )}

      <NotificationModal 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        notifications={notifications} 
      />
      <PlantDiagnosis 
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
      />
      <LegalModal 
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onShowPrivacy={() => setIsLegalOpen(true)}
      />

      <GardenModal 
        isOpen={isGardenSectionOpen}
        onClose={() => setIsGardenSectionOpen(false)}
        serviceType={gardenServiceType}
        setServiceType={setGardenServiceType}
        photo={gardenPhoto}
        setPhoto={setGardenPhoto}
        notes={gardenNotes}
        setNotes={setGardenNotes}
        onCapture={handleGardenCapture}
        onOrder={handleGardenOrder}
      />

      {!showSplash && !showRegistration && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col h-[100dvh] relative overflow-hidden"
        >
          {/* Header - Fixed/Frozen in place */}
          <header className="bg-[#B71C1C] pt-[env(safe-area-inset-top)] min-h-[3.5rem] flex-none flex flex-col shadow-2xl z-[100] w-full border-b border-white/20">
            <div className="h-14 flex items-center justify-between px-4 w-full">
              <div className="flex items-center space-x-reverse space-x-3">
              {currentLevel > 1 && (
                <motion.button 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={goBack} 
                  className="text-white p-2 hover:bg-red-800 rounded-2xl flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-red-900/60 px-4 border border-white/20 active:translate-y-0.5"
                >
                  <ChevronRight size={24} />
                  <span className="font-black text-base ml-1 tracking-tighter">رجوع</span>
                </motion.button>
              )}
              <button 
                onClick={async () => {
                  if (Capacitor.isNativePlatform()) {
                    await CapApp.exitApp();
                  } else {
                    if (window.confirm("هل تريد إغلاق التطبيق؟")) {
                      window.close();
                      window.location.href = "about:blank";
                      alert("نظام الأمان في المتصفح قد يمنع إغلاق هذه الصفحة تلقائياً. يرجى إغلاق علامة التبويب يدوياً.");
                    }
                  }
                }}
                className="text-white p-2 hover:bg-red-800 rounded-full transition-colors"
                title="إغلاق التطبيق"
              >
                <Power size={26} />
              </button>

              <button 
                onClick={() => {
                  setLoading(true);
                  // We need to access fetchData here. Since it's inside useEffect, 
                  // I might need to lift it out or use a state-triggered sync.
                  // For now, I'll use location.reload as a safe fallback that triggers useEffect.
                  sessionStorage.removeItem('zone_sheets_synced');
                  window.location.reload();
                }}
                className={`text-white p-2 hover:bg-red-800 rounded-full transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
                title="تحديث البيانات"
                disabled={loading}
              >
                <RefreshCw size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center max-w-[45%]">
              <span className="wood-carved text-xs sm:text-lg md:text-3xl drop-shadow-2xl px-1 truncate w-full text-center">زون للخدمات الزراعية</span>
            </div>

            <div className="flex items-center space-x-reverse space-x-4">
              <button 
                onClick={() => {
                  setIsNotificationOpen(true);
                  setLastViewedCount(notifications.length);
                  localStorage.setItem('zone_viewed_notifications', notifications.length.toString());
                }}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Bell size={26} />
                {notifications.length > lastViewedCount && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: 1 
                    }}
                    transition={{
                      scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-[#B71C1C] shadow-lg shadow-black/20 z-10"
                  >
                    {notifications.length - lastViewedCount}
                  </motion.div>
                )}
              </button>

              {cart.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="bg-yellow-500 text-red-900 px-3 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center space-x-reverse space-x-1"
                >
                  <ShoppingCart size={12} />
                  <span>السلة</span>
                </motion.button>
              )}

              {/* Inflatable Shopping Cart with Golden Counter */}
              <motion.div 
                animate={isCartInflating ? { 
                  scale: [1, 1.5, 0.9, 1.1, 1],
                  rotate: [0, 15, -15, 10, 0] 
                } : isLocked ? {
                  x: [0, -2, 2, -2, 2, 0],
                  transition: { repeat: Infinity, duration: 0.5 }
                } : {}}
                transition={{ duration: 0.6 }}
                className="relative cursor-pointer group"
              >
                <div 
                  onClick={() => setIsCartDrawerOpen(true)}
                  className={`p-2 rounded-xl transition-all duration-500 ${isLocked ? 'bg-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'hover:bg-white/10 relative'}`}>
                  <ShoppingCart 
                    size={30} 
                    className={`transition-all duration-500 ${isLocked ? 'text-yellow-400 scale-110' : 'text-white'} ${cart.length > 0 ? 'animate-pulse' : ''}`} 
                  />
                  
                  {showCartHint && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 right-0 bg-yellow-500 text-red-900 px-3 py-1 rounded-lg text-[8px] font-black whitespace-nowrap shadow-xl z-50"
                    >
                      اضغط هنا للمراجعة والمواصلة
                    </motion.div>
                  )}
                </div>

                {cart.length > 0 && (
                  <motion.div 
                    key={cart.length}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-b from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#4A3700] text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/80 z-20"
                    style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(184,134,11,0.5)' }}
                  >
                    {cart.length}
                  </motion.div>
                )}

                <AnimatePresence>
                  {isLocked && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -inset-1 border-2 border-yellow-400 rounded-2xl pointer-events-none"
                    >
                      <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-yellow-400/10 rounded-2xl"
                      />
                      <Lock size={12} className="absolute -bottom-1 -left-1 text-yellow-400 bg-[#B71C1C] rounded-full p-0.5 border border-yellow-400 shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <button 
                onClick={() => setIsAboutOpen(true)}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Info size={26} />
              </button>
            </div>
          </div>
        </header>

          {/* Scrollable Main Content */}
          <div id="main-content" className={`flex-1 overflow-y-auto relative no-scrollbar transition-colors duration-500 ${isProductView ? 'bg-[#0a192f]' : 'bg-[#F6F6F8]'}`}>
          
          {/* Sticky Massive Invoice Button - Frozen at top below header */}
          {cart.length > 0 && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-[90] w-full px-4 py-2 bg-white/80 backdrop-blur-md shadow-md"
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 15px 40px rgba(37,99,235,0.5)" }}
                onClick={() => setIsCartDrawerOpen(true)}
                className="w-full h-20 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white rounded-3xl font-black text-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border-4 border-white/20 flex items-center justify-center space-x-reverse space-x-4 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-shine pointer-events-none" />
                <ShoppingCart size={36} className="drop-shadow-lg" />
                <span className="drop-shadow-lg">الانتقال إلى السلة</span>
                <div className="bg-white/20 px-5 py-2 rounded-full text-xl border border-white/30">
                  {cart.length}
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Dynamic Filter Path / Royal Banner */}
          <div className="px-2 py-2 flex flex-col space-y-2 bg-transparent z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">
                  {currentLevel === 1 ? 'القائمة الرئيسية' : currentLevel === 2 ? filters[0] : `${filters[0]} / ${filters[1]}`}
                </span>
              </div>
              <span className="text-gray-900 text-sm font-black tracking-tight">{userData?.name || 'زائر'}</span>
            </div>

            {/* Combined Search and Diagnosis Row - Each taking half width to save space */}
            <div className="flex gap-2 mb-2">
              {/* 3D Smart Search Bar - Half Width */}
              <div className="flex-1 relative group perspective-1000">
                <motion.div
                  animate={{
                    boxShadow: isSearchFocused 
                      ? "0 2px 10px rgba(46, 125, 50, 0.4)" 
                      : "0 4px 0 #1B5E20, 0 6px 10px rgba(0,0,0,0.15)",
                    y: isSearchFocused ? 1 : 0
                  }}
                  className={`relative w-full h-12 bg-[#2E7D32] rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isSearchFocused ? 'border-green-400' : 'border-[#1B5E20]/60'
                  } shadow-[0_4px_0_#1B5E20,0_6px_10px_rgba(0,0,0,0.15)] active:translate-y-[2px] active:shadow-[0_1px_0_#1B5E20,0_2px_4px_rgba(0,0,0,0.1)]`}
                >
                  <input 
                    type="text" 
                    placeholder="بحث ذكي..." 
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-transparent px-8 text-sm font-black text-white focus:outline-none placeholder:text-white/40 relative z-10"
                    dir="rtl"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <Search size={18} className="text-white opacity-80" />
                  </div>
                </motion.div>
              </div>

              {/* Zoon Doctor Diagnosis Button - Half Width */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setIsDiagnosisOpen(true)}
                className="flex-1 h-12 bg-[#2E7D32] text-white rounded-2xl font-black text-xs shadow-[0_4px_0_#1B5E20,0_6px_10px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border-b-2 border-white/10 relative overflow-hidden group active:translate-y-[2px] active:shadow-[0_1px_0_#1B5E20,0_2px_4px_rgba(0,0,0,0.1)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                  <span>طبيب زون</span>
                  <Camera size={14} className="text-white" />
                </div>
                <span className="text-[7px] mt-0.5 text-white/70">تشخيص عام لأمراض النباتات</span>
              </motion.button>
            </div>

            {currentLevel > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] text-gray-400 font-bold"
              >
                تصفية حسب: {filters.join(' > ')}
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`fixed top-20 left-4 right-4 z-[100] p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl border-2 flex items-start space-x-reverse space-x-4 ${
                  notification.type === 'success' ? 'bg-green-600/90 border-green-400 text-white' : 
                  notification.type === 'error' ? 'bg-red-700/90 border-red-500 text-white' : 
                  'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] border-[#FFD700] text-[#4A3700]'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-black leading-relaxed drop-shadow-sm">{notification.message}</p>
                </div>
                <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid with Slide Animation */}
          <main className={`flex-1 px-4 relative z-10 overflow-hidden transition-colors duration-500 ${isProductView ? 'bg-[#0a192f]' : 'bg-transparent'}`}>
            {/* Glowing Light Effects */}
            {isProductView && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)]" />
              </div>
            )}

            {loading && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] relative z-20">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                    filter: isProductView 
                      ? ["drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))", "drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))", "drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))"]
                      : ["drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))", "drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))", "drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))"]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-32 h-32 backdrop-blur-md rounded-[2.5rem] border-2 shadow-2xl relative overflow-hidden flex items-center justify-center ${isProductView ? 'bg-white/20 border-white/30' : 'bg-white border-green-100'}`}
                >
                  <img src="https://i.ibb.co/qFgDcx2b/logo.png" className={`w-full h-full object-contain transition-all ${isProductView ? 'brightness-0 invert' : ''}`} alt="loading" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 border-t-4 rounded-full ${isProductView ? 'border-blue-400' : 'border-green-600'}`}
                    style={{ margin: '-4px' }}
                  />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mt-8 text-center"
                >
                  {data.length === 0 && <span className={`font-black text-xl tracking-[0.2em] drop-shadow-lg ${isProductView ? 'text-blue-100' : 'text-green-900'}`}>جاري التحديث الذكي...</span>}
                  {data.length === 0 && <p className={`font-bold text-xs mt-2 italic ${isProductView ? 'text-blue-300/60' : 'text-gray-400'}`}>نحن نقوم بجلب أفضل الشتلات والمنتجات لك</p>}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 10 }}
                    className={`font-bold text-[10px] mt-4 ${isProductView ? 'text-blue-400/60' : 'text-gray-400'}`}
                  >
                    يبدو أن الاتصال بطيء، جاري المحاولة مرة أخرى...
                  </motion.p>
                </motion.div>
              </div>
            ) : networkError && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] relative z-20 px-6 text-center">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border ${isProductView ? 'bg-red-500/20 backdrop-blur-md border-red-500/30' : 'bg-red-50 border-red-100'}`}>
                  <AlertTriangle size={48} className={isProductView ? "text-red-400" : "text-red-600"} />
                </div>
                <h2 className={`text-2xl font-black mb-2 ${isProductView ? 'text-white' : 'text-red-800'}`}>عذراً، فشل تحديث البيانات</h2>
                <p className={`font-bold mb-8 max-w-sm ${isProductView ? 'text-blue-100/70' : 'text-gray-600'}`}>{networkError}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setNetworkError(null);
                    setLoading(true);
                    window.location.reload(); 
                  }}
                  className={`px-10 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 border-b-4 ${isProductView ? 'bg-blue-600 text-white border-blue-900' : 'bg-red-700 text-white border-red-900'}`}
                >
                  <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                  <span>{loading ? "جاري التحديث..." : "إعادة المحاولة الآن"}</span>
                </motion.button>
                <p className={`mt-6 text-[10px] font-bold uppercase tracking-wider ${isProductView ? 'text-blue-200/50' : 'text-gray-400'}`}>تأكد من اتصالك بالإنترنت وحاول مرة أخرى</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentLevel + (filters.join('-'))}
                  initial={{ x: 150, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -150, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className={`w-full max-w-full mx-auto pt-6 relative z-10 ${currentLevel === 1 ? 'grid grid-cols-3 gap-[4vw] px-[4vw]' : 'grid grid-cols-2 gap-x-[6vw] gap-y-12 px-[2vw]'}`}
                >
                  {isTransitioning ? (
                    <div className="flex flex-col items-center justify-center h-[30vh] w-full col-span-full py-10">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <div className="w-16 h-16 border-4 border-green-100 rounded-full" />
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full"
                        />
                      </motion.div>
                      <p className="mt-4 text-green-800 font-black text-xs animate-pulse">جاري فحص وتحديث البيانات...</p>
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[30vh] w-full col-span-full opacity-60">
                      <ShoppingCart size={64} className="text-gray-300 mb-4" />
                      <p className="font-bold text-gray-400">لا يوجد منتجات متاحة هنا حالياً</p>
                    </div>
                  ) : (
                    currentItems.map((item: any, index) => (
                      item.type === 'level1' || item.type === 'level2' || item.type === 'static' ? (
                        <div key={item.id} className={currentLevel === 1 ? '' : 'col-span-1'}>
                          <AnimatedButton 
                            icon={getIcon(item.label, index)} 
                            label={item.label} 
                            onClick={() => {
                              if (item.type === 'static' && item.id === 'garden-design') {
                                setIsGardenSectionOpen(true);
                              } else {
                                handleItemClick(item.label);
                              }
                            }}
                            level={currentLevel}
                            isGlossy={currentLevel === 1 && item.label === 'نباتات الزينة'}
                          />
                        </div>
                      ) : (
                        <div key={item.id} className="col-span-1">
                          <ProductCard 
                            name={item.label}
                            price={item.price}
                            image={item.image}
                            onAddToCart={() => addToCart(item)}
                            onImageClick={(img) => setZoomedImage(img)}
                          />
                        </div>
                      )
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </main>

          {/* قسم رابط الموقع الإلكتروني والجهة المطورة - يظهر فقط عند وجود بيانات */}
          {((websiteUrl && websiteUrl.startsWith('http')) || footerLine1 || footerLine2) && (
            <div className={`w-full px-6 py-4 flex flex-col items-center space-y-2 relative z-10 transition-all duration-500 ${isProductView ? 'bg-gradient-to-t from-[#050c18] to-transparent' : 'bg-gradient-to-t from-gray-200/50 to-transparent'}`}>
              
              {websiteUrl && websiteUrl.startsWith('http') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => window.open(websiteUrl, '_blank')}
                  className={`w-full max-w-md h-20 p-4 border-2 rounded-[2.5rem] shadow-2xl flex items-center gap-4 group transition-all backdrop-blur-md ${isProductView ? 'bg-white/10 border-white/10' : 'bg-white border-green-50'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0 shadow-inner ${isProductView ? 'bg-blue-500/20' : 'bg-green-50'}`}>
                    <Globe size={24} className={isProductView ? "text-blue-300" : "text-green-700"} />
                  </div>
                  <div className="text-right flex-1">
                    <p className={`text-xs font-black ${isProductView ? 'text-white' : 'text-green-800'}`}>تفضلوا بزيارة موقعنا الرسمي</p>
                    <p className={`text-[10px] font-bold tracking-wider ${isProductView ? 'text-blue-300/60' : 'text-gray-400'}`}>
                      {(() => {
                        try { return new URL(websiteUrl).hostname.replace('www.', ''); }
                        catch { return websiteUrl; }
                      })()}
                    </p>
                  </div>
                  <ExternalLink size={16} className={isProductView ? "text-white/30 ml-2" : "text-gray-300 ml-2"} />
                </motion.button>
              )}

              {/* قسم المطور والمعلومات الإضافية من جدول البيانات */}
              <div className="text-center space-y-2 px-4 pb-8">
                {footerLine1 && (
                  <p className={`text-[13px] font-black leading-relaxed drop-shadow-md ${isProductView ? 'text-blue-100' : 'text-gray-600'}`}>
                    {footerLine1}
                  </p>
                )}
                {footerLine2 && (
                  <p className={`text-[11px] font-bold italic leading-relaxed ${isProductView ? 'text-blue-300/60' : 'text-gray-400'}`}>
                    {footerLine2}
                  </p>
                )}
              </div>
            </div>
          )}

          </div>
        </motion.div>
      )}

      {/* Image Zoom Modal with Rotation Effect */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-10 right-10 text-white p-3 bg-red-600 rounded-full shadow-2xl z-[510]"
              onClick={() => setZoomedImage(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.div
              layoutId={zoomedImage}
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 20, opacity: 0 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
            >
              <motion.img
                src={zoomedImage ? Capacitor.convertFileSrc(zoomedImage) : ''}
                alt="Zoomed"
                className="max-w-full max-h-[75vh] object-contain rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.2)] border-8 border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <div className="mt-8 text-center bg-white/10 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/20">
                <p className="text-white font-black text-xl tracking-tighter">مشتل زون - جودة الطبيعة في منزلك</p>
                <div className="flex gap-2 justify-center mt-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-ping delay-75" />
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping delay-150" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
