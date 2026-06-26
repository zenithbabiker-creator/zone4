import React, { ReactNode } from 'react';
import { 
  LeafyGreen, FlaskConical, Bug, Flower2, Trees, Mountain, Home, Sun, Infinity as InfinityIcon, 
  Wind, Carrot, Palmtree, Shrub, Pill, Flower, Gift, Droplets, Scissors, Shovel, Wrench, 
  Store, Package, TreePine, Cherry, Apple, Banana, Citrus, Wheat, Waves, Flame, Zap, 
  Heart, Star, Globe, Compass, Map, Anchor, Bike, Car, Plane, Train, Music, Video, 
  Mic, Headphones, Book, Pen, Palette, Gamepad, Trophy, Target, Flag, Coffee, Utensils, 
  GlassWater, Pizza, IceCream, Cake, Cookie, Candy, Egg, Fish, Bone, PawPrint, Bird, 
  Rabbit, Turtle, Snail, Shell, Feather, Umbrella, Tent, Binoculars, Telescope, Microscope, 
  Stethoscope, Activity, HeartPulse, Thermometer, CloudLightning, CloudRain, CloudSnow, 
  Moon, Sunrise, Sunset, Rainbow, Sparkles, Shield, Key, LockKeyhole, Eye, Fingerprint, 
  Cpu, HardDrive, Database, Server, Monitor, Laptop, Tablet, Printer, Mouse, Keyboard, 
  Speaker, Tv, Radio, Cast, Wifi, Bluetooth, Battery, Plug, Lightbulb, Flashlight, 
  Calculator, Calendar, Mail, Inbox, Send, Archive, HardHat, Construction, Truck, 
  Bus, Ship, TramFront, CableCar, MountainSnow, Trees as TreesIcon, TreeDeciduous, 
  Clover, Dna, Atom, Magnet, GraduationCap, School, Library, Church, Hotel, Hospital, 
  Factory, Warehouse, ShoppingBag, Tag, Ticket, Wallet, Coins, Banknote, Receipt, 
  BarChart, PieChart, LineChart, AreaChart, Presentation, Languages, MessageSquare, 
  MessageCircle, Phone, Share2, ExternalLink, Link, Paperclip, Bookmark, StickyNote, 
  Folder, File, Files, Image, Play, Pause, Square, Circle, Triangle, Hexagon, Pentagon, 
  Octagon, Smile, Frown, Meh, Angry, Laugh, Ghost, Skull, Crown, Gem, Medal, Award, 
  Badge, Check, Minus, Plus, Equal, Divide, Percent, Hash, AtSign, Command, Option, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Layout, Columns, Rows, Grid, List, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, 
  Strikethrough, Code, Sprout, Flower2 as Flower2Icon, Trees as TreesIcon2, Leaf,
  Cloud, Hammer, Container, Grape
} from 'lucide-react';

export const normalize = (text: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ئؤ]/g, 'ء')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, '')
    .replace(/ال/g, '') // Remove "Al-" prefix common in Arabic
    .trim();
};

export const transformDriveUrl = (url: string) => {
  if (!url || typeof url !== 'string') return "";
  let trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http')) return "";
  
  if (trimmedUrl.includes('drive.google.com')) {
    const idMatch = trimmedUrl.match(/\/file\/d\/([^\/\?]+)/) || trimmedUrl.match(/id=([^\&]+)/);
    if (idMatch && idMatch[1]) {
      return `https://docs.google.com/uc?export=download&id=${idMatch[1]}`;
    }
  }
  
  return trimmedUrl;
};

export const getIcon = (label: string, _index?: number) => {
  const normalizedLabel = normalize(label);
  const labelLower = label.toLowerCase();
  
  const isPot = normalizedLabel.includes('اصيص') || normalizedLabel.includes('اصاءص') || normalizedLabel.includes('مركن') || normalizedLabel.includes('مراكن') || normalizedLabel.includes('حوض') || normalizedLabel.includes('احواض');
  
  if (normalizedLabel.includes('تصميم') || normalizedLabel.includes('تنسيق')) {
    return <Sprout size="8vw" />;
  }
  
  // Specific plant types BEFORE general plant match
  if (normalizedLabel.includes('صبار') || normalizedLabel.includes('صباريات')) return <Mountain size="8vw" />;
  if (normalizedLabel.includes('ظل') || normalizedLabel.includes('داخليه')) return <Leaf size="8vw" />;
  if (normalizedLabel.includes('خارجي') || normalizedLabel.includes('شمس')) return <Sun size="8vw" />;
  if (normalizedLabel.includes('زهر') || normalizedLabel.includes('ورد') || normalizedLabel.includes('زهور')) return <Flower2 size="8vw" />;
  if (normalizedLabel.includes('شجر') || normalizedLabel.includes('اشجار')) return <Trees size="8vw" />;
  if (normalizedLabel.includes('متسلق') || normalizedLabel.includes('متسلقات')) return <InfinityIcon size="8vw" />;
  if (normalizedLabel.includes('عطر') || normalizedLabel.includes('عطريات')) return <Wind size="8vw" />;

  if (labelLower.includes('نبات') || labelLower.includes('شتله') || labelLower.includes('اشجار') || labelLower.includes('زهور')) {
    return <LeafyGreen size="8vw" />;
  }
  
  if (isPot || normalizedLabel.includes('فخار') || normalizedLabel.includes('سمنت') || normalizedLabel.includes('استيل')) {
    const BasePot = ({ children }: { children?: ReactNode }) => (
      <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10h10l-1 9H8l-1-9Z" fill="rgba(255,255,255,0.1)" />
        <path d="M6 5h12v3H6z" fill="rgba(255,255,255,0.2)" />
        {children}
      </svg>
    );

    if (normalizedLabel.includes('بلاستيك')) {
      return (
        <BasePot>
          <path d="M8 13h8" stroke="white" opacity="0.4" strokeWidth="1" />
          <path d="M9 16h6" stroke="white" opacity="0.4" strokeWidth="1" />
        </BasePot>
      );
    }
    if (normalizedLabel.includes('خزف') || normalizedLabel.includes('سيراميك')) {
      return (
        <BasePot>
          <circle cx="12" cy="14" r="2.5" stroke="white" strokeWidth="1.5" />
          <circle cx="12" cy="14" r="0.5" fill="white" />
        </BasePot>
      );
    }
    if (normalizedLabel.includes('استيل') || normalizedLabel.includes('معدن')) {
      return (
        <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 10h12l-1 10H7l-1-10Z" fill="rgba(255,255,255,0.1)" />
          <path d="M5 5h14v3H5z" fill="white" />
          <path d="M8 10v10M12 10v10M16 10v10" stroke="white" strokeWidth="1" opacity="0.4" />
        </svg>
      );
    }
    if (normalizedLabel.includes('سمنت') || normalizedLabel.includes('اسمنت') || normalizedLabel.includes('خرسان')) {
      return (
        <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 10h14l-1.5 10h-11L5 10Z" fill="rgba(255,255,255,0.2)" />
          <path d="M4 5h16v4H4z" fill="white" />
          <rect x="8" y="12" width="2" height="2" fill="white" />
          <rect x="14" y="15" width="2" height="2" fill="white" />
        </svg>
      );
    }
    if (normalizedLabel.includes('زينه') || normalizedLabel.includes('ديكور')) {
      return (
        <BasePot>
          <path d="M12 10v4M10 12h4" stroke="white" />
        </BasePot>
      );
    }

    return (
      <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10h10l-1 9H8l-1-9Z" fill="rgba(255,255,255,0.1)" />
        <path d="M6 5h12v3H6z" fill="rgba(255,255,255,0.2)" />
        <path d="M9 13h6" stroke="white" />
        <path d="M10 16h4" stroke="white" />
      </svg>
    );
  }
  if (normalizedLabel.includes('سماد') || normalizedLabel.includes('اسمدة')) return <FlaskConical size="8vw" />;
  if (normalizedLabel.includes('مبيد') || normalizedLabel.includes('مبيدات')) return <Bug size="8vw" />;
  if (normalizedLabel.includes('فاكهه') || normalizedLabel.includes('فواكه') || normalizedLabel.includes('مثمر')) return (
    <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="white">
      <path d="M12 22c-1 0-1.5-1-1.5-4 0-2 1-4 1.5-6 0.5 2 1.5 4 1.5 6 0 3-.5 4-1.5 4z" />
      <path d="M12 2C7 2 3 6 3 11c0 3 2 6 5 8M12 2c5 0 9 4 9 9 0 3-2 6-5 8" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="5" r="1.2" />
      <circle cx="8" cy="8" r="1.2" />
      <circle cx="16" cy="8" r="1.2" />
      <circle cx="12" cy="9" r="1.2" />
      <circle cx="10" cy="12" r="1.2" />
      <circle cx="14" cy="12" r="1.2" />
      <circle cx="7" cy="11" r="1" />
      <circle cx="17" cy="11" r="1" />
      <circle cx="12" cy="14" r="1" />
      <circle cx="9" cy="5" r="0.8" />
      <circle cx="15" cy="5" r="0.8" />
      <circle cx="12" cy="17" r="0.8" />
    </svg>
  );
  if (normalizedLabel.includes('خضر') || normalizedLabel.includes('خضروات')) return <Carrot size="8vw" />;
  if (normalizedLabel.includes('ادوات') || normalizedLabel.includes('معدات')) return (
    <svg width="10vw" height="10vw" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 17l10-10" />
      <path d="M16 17L6 7" />
      <path d="M12 4v4" strokeWidth="1.5" />
      <path d="M9 4h6" strokeWidth="1.5" />
      <path d="M9 2l1-2M15 2l-1-2" strokeWidth="1" opacity="0.6" />
    </svg>
  );
  if (normalizedLabel.includes('نخيل') || normalizedLabel.includes('نخله')) return <Palmtree size="8vw" />;
  if (normalizedLabel.includes('شجيرات')) return <Shrub size="8vw" />;
  if (normalizedLabel.includes('طبيه') || normalizedLabel.includes('علاج')) return <Pill size="8vw" />;
  if (normalizedLabel.includes('زينه')) return <Flower size="8vw" />;
  if (labelLower.includes('هديه') || labelLower.includes('هدايا')) return <Gift size="8vw" />;
  if (labelLower.includes('تربه') || labelLower.includes('طين')) return <Mountain size="8vw" />;
  if (labelLower.includes('ري') || labelLower.includes('ماء')) return <Droplets size="8vw" />;
  if (labelLower.includes('مقص') || labelLower.includes('تقليم')) return <Scissors size="8vw" />;
  if (labelLower.includes('كوريك') || labelLower.includes('حفر')) return <Shovel size="8vw" />;
  if (labelLower.includes('صيانه')) return <Wrench size="8vw" />;
  if (labelLower.includes('متجر') || labelLower.includes('محل')) return <Store size="8vw" />;
  if (labelLower.includes('كرتون') || labelLower.includes('تغليف')) return <Package size="8vw" />;
  if (labelLower.includes('صنوبر')) return <TreePine size="8vw" />;
  if (labelLower.includes('كرز')) return <Cherry size="8vw" />;
  if (labelLower.includes('تفاح')) return <Apple size="8vw" />;
  if (labelLower.includes('موز')) return <Banana size="8vw" />;
  if (labelLower.includes('حمضيات') || labelLower.includes('ليمون')) return <Citrus size="8vw" />;
  if (labelLower.includes('قمح') || labelLower.includes('محاصيل')) return <Wheat size="8vw" />;
  if (labelLower.includes('بحر') || labelLower.includes('نيل')) return <Waves size="8vw" />;
  if (labelLower.includes('نار') || labelLower.includes('حراره')) return <Flame size="8vw" />;
  if (labelLower.includes('كهرباء') || labelLower.includes('طاقه')) return <Zap size="8vw" />;
  if (labelLower.includes('حب') || labelLower.includes('قلب')) return <Heart size="8vw" />;
  if (labelLower.includes('نجمه') || labelLower.includes('مميز')) return <Star size="8vw" />;
  if (labelLower.includes('ع عالم') || labelLower.includes('دولي')) return <Globe size="8vw" />;
  if (labelLower.includes('بوصله') || labelLower.includes('اتجاه')) return <Compass size="8vw" />;
  if (labelLower.includes('خريطه')) return <Map size="8vw" />;
  if (labelLower.includes('مرسى')) return <Anchor size="8vw" />;
  if (labelLower.includes('دراجه')) return <Bike size="8vw" />;
  if (labelLower.includes('سياره')) return <Car size="8vw" />;
  if (labelLower.includes('طائره')) return <Plane size="8vw" />;
  if (labelLower.includes('قطار')) return <Train size="8vw" />;
  if (labelLower.includes('موسيقى')) return <Music size="8vw" />;
  if (labelLower.includes('فيديو')) return <Video size="8vw" />;
  if (labelLower.includes('مايك')) return <Mic size="8vw" />;
  if (labelLower.includes('سماعه')) return <Headphones size="8vw" />;
  if (labelLower.includes('كتاب')) return <Book size="8vw" />;
  if (labelLower.includes('قلم')) return <Pen size="8vw" />;
  if (labelLower.includes('الوان')) return <Palette size="8vw" />;
  if (labelLower.includes('العاب')) return <Gamepad size="8vw" />;
  if (labelLower.includes('كاس')) return <Trophy size="8vw" />;
  if (labelLower.includes('هدف')) return <Target size="8vw" />;
  if (labelLower.includes('علم')) return <Flag size="8vw" />;
  if (labelLower.includes('قهوه')) return <Coffee size="8vw" />;
  if (labelLower.includes('طعام')) return <Utensils size="8vw" />;
  if (labelLower.includes('ماء')) return <GlassWater size="8vw" />;
  if (labelLower.includes('بيتزا')) return <Pizza size="8vw" />;
  if (labelLower.includes('ايسكريم')) return <IceCream size="8vw" />;
  if (labelLower.includes('كيك')) return <Cake size="8vw" />;
  if (labelLower.includes('بسكويت')) return <Cookie size="8vw" />;
  if (labelLower.includes('حلاوه')) return <Candy size="8vw" />;
  if (labelLower.includes('بيض')) return <Egg size="8vw" />;
  if (labelLower.includes('سمك')) return <Fish size="8vw" />;
  if (labelLower.includes('عظم')) return <Bone size="8vw" />;
  if (labelLower.includes('حيوان')) return <PawPrint size="8vw" />;
  if (labelLower.includes('طير')) return <Bird size="8vw" />;
  if (labelLower.includes('ارنب')) return <Rabbit size="8vw" />;
  if (labelLower.includes('سلحفاه')) return <Turtle size="8vw" />;
  if (labelLower.includes('حلزون')) return <Snail size="8vw" />;
  if (labelLower.includes('صدف')) return <Shell size="8vw" />;
  if (labelLower.includes('ريشه')) return <Feather size="8vw" />;
  if (labelLower.includes('مظله')) return <Umbrella size="8vw" />;
  if (labelLower.includes('خيمه')) return <Tent size="8vw" />;
  if (labelLower.includes('منظار')) return <Binoculars size="8vw" />;
  if (labelLower.includes('تلسكوب')) return <Telescope size="8vw" />;
  if (labelLower.includes('مجهر')) return <Microscope size="8vw" />;
  if (labelLower.includes('سماعه_طبيه')) return <Stethoscope size="8vw" />;
  if (labelLower.includes('نشاط')) return <Activity size="8vw" />;
  if (labelLower.includes('نبض')) return <HeartPulse size="8vw" />;
  if (labelLower.includes('حراره')) return <Thermometer size="8vw" />;
  if (labelLower.includes('برق')) return <CloudLightning size="8vw" />;
  if (labelLower.includes('مطر')) return <CloudRain size="8vw" />;
  if (labelLower.includes('ثلج')) return <CloudSnow size="8vw" />;
  if (labelLower.includes('قمر')) return <Moon size="8vw" />;
  if (labelLower.includes('شروق')) return <Sunrise size="8vw" />;
  if (labelLower.includes('غروب')) return <Sunset size="8vw" />;
  if (labelLower.includes('قوس_قزح')) return <Rainbow size="8vw" />;
  if (labelLower.includes('لمعان')) return <Sparkles size="8vw" />;
  if (labelLower.includes('درع')) return <Shield size="8vw" />;
  if (labelLower.includes('مفتاح')) return <Key size="8vw" />;
  if (labelLower.includes('قفل')) return <LockKeyhole size="8vw" />;
  if (labelLower.includes('عين')) return <Eye size="8vw" />;
  if (labelLower.includes('بصمه')) return <Fingerprint size="8vw" />;
  if (labelLower.includes('معالج')) return <Cpu size="8vw" />;
  if (labelLower.includes('قرص')) return <HardDrive size="8vw" />;
  if (labelLower.includes('قاعده_بيانات')) return <Database size="8vw" />;
  if (labelLower.includes('خادم')) return <Server size="8vw" />;
  if (labelLower.includes('شاشه')) return <Monitor size="8vw" />;
  if (labelLower.includes('محمول')) return <Laptop size="8vw" />;
  if (labelLower.includes('تابلت')) return <Tablet size="8vw" />;
  if (labelLower.includes('طابعه')) return <Printer size="8vw" />;
  if (labelLower.includes('فاره')) return <Mouse size="8vw" />;
  if (labelLower.includes('لوحه_مفاتيح')) return <Keyboard size="8vw" />;
  if (labelLower.includes('مكبر_صوت')) return <Speaker size="8vw" />;
  if (labelLower.includes('تلفاز')) return <Tv size="8vw" />;
  if (labelLower.includes('راديو')) return <Radio size="8vw" />;
  if (labelLower.includes('بث')) return <Cast size="8vw" />;
  if (labelLower.includes('واي_فاي')) return <Wifi size="8vw" />;
  if (labelLower.includes('بلوتوث')) return <Bluetooth size="8vw" />;
  if (labelLower.includes('بطاريه')) return <Battery size="8vw" />;
  if (labelLower.includes('قابس')) return <Plug size="8vw" />;
  if (labelLower.includes('مصباح')) return <Lightbulb size="8vw" />;
  if (labelLower.includes('كشاف')) return <Flashlight size="8vw" />;
  if (labelLower.includes('حاسبه')) return <Calculator size="8vw" />;
  if (labelLower.includes('تقويم')) return <Calendar size="8vw" />;
  if (labelLower.includes('بريد')) return <Mail size="8vw" />;
  if (labelLower.includes('صندوق')) return <Inbox size="8vw" />;
  if (labelLower.includes('ارسال')) return <Send size="8vw" />;
  if (labelLower.includes('ارشيف')) return <Archive size="8vw" />;
  if (labelLower.includes('خوذه')) return <HardHat size="8vw" />;
  if (labelLower.includes('بناء')) return <Construction size="8vw" />;
  if (labelLower.includes('شاحنه')) return <Truck size="8vw" />;
  if (labelLower.includes('حافله')) return <Bus size="8vw" />;
  if (labelLower.includes('سفينه')) return <Ship size="8vw" />;
  if (labelLower.includes('ترام')) return <TramFront size="8vw" />;
  if (labelLower.includes('تلفريك')) return <CableCar size="8vw" />;
  if (labelLower.includes('جبل')) return <MountainSnow size="8vw" />;
  if (labelLower.includes('غابه')) return <TreesIcon size="8vw" />;
  if (labelLower.includes('شجره')) return <TreeDeciduous size="8vw" />;
  if (labelLower.includes('برسيم')) return <Clover size="8vw" />;
  if (labelLower.includes('نبته')) return <Flower size="8vw" />;
  if (labelLower.includes('حمض')) return <Dna size="8vw" />;
  if (labelLower.includes('ذره')) return <Atom size="8vw" />;
  if (labelLower.includes('مغناطيس')) return <Magnet size="8vw" />;
  if (labelLower.includes('تخرج')) return <GraduationCap size="8vw" />;
  if (labelLower.includes('مدرسه')) return <School size="8vw" />;
  if (labelLower.includes('مكتبه')) return <Library size="8vw" />;
  if (labelLower.includes('كنيسه')) return <Church size="8vw" />;
  if (labelLower.includes('فندق')) return <Hotel size="8vw" />;
  if (labelLower.includes('مستشفى')) return <Hospital size="8vw" />;
  if (labelLower.includes('مصنع')) return <Factory size="8vw" />;
  if (labelLower.includes('مستودع')) return <Warehouse size="8vw" />;
  if (labelLower.includes('حقيبه')) return <ShoppingBag size="8vw" />;
  if (labelLower.includes('بطاقه')) return <Tag size="8vw" />;
  if (labelLower.includes('تذكره')) return <Ticket size="8vw" />;
  if (labelLower.includes('محفظه')) return <Wallet size="8vw" />;
  if (labelLower.includes('عملات')) return <Coins size="8vw" />;
  if (labelLower.includes('نقد')) return <Banknote size="8vw" />;
  if (labelLower.includes('ايصال')) return <Receipt size="8vw" />;
  if (labelLower.includes('رسم_بياني')) return <BarChart size="8vw" />;
  if (labelLower.includes('دائره')) return <PieChart size="8vw" />;
  if (labelLower.includes('خط')) return <LineChart size="8vw" />;
  if (labelLower.includes('مساحه')) return <AreaChart size="8vw" />;
  if (labelLower.includes('عرض')) return <Presentation size="8vw" />;
  if (labelLower.includes('لغات')) return <Languages size="8vw" />;
  if (labelLower.includes('دردشه')) return <MessageSquare size="8vw" />;
  if (labelLower.includes('دائره_دردشه')) return <MessageCircle size="8vw" />;
  if (labelLower.includes('هاتف')) return <Phone size="8vw" />;
  if (labelLower.includes('مشاركه')) return <Share2 size="8vw" />;
  if (labelLower.includes('رابط_خارجي')) return <ExternalLink size="8vw" />;
  if (labelLower.includes('رابط')) return <Link size="8vw" />;
  if (labelLower.includes('مشبك')) return <Paperclip size="8vw" />;
  if (labelLower.includes('اشاره')) return <Bookmark size="8vw" />;
  if (labelLower.includes('ملاحظه')) return <StickyNote size="8vw" />;
  if (labelLower.includes('مجلد')) return <Folder size="8vw" />;
  if (labelLower.includes('ملف')) return <File size="8vw" />;
  if (labelLower.includes('ملفات')) return <Files size="8vw" />;
  if (labelLower.includes('صوره')) return <Image size="8vw" />;
  if (labelLower.includes('تشغيل')) return <Play size="8vw" />;
  if (labelLower.includes('توقف')) return <Pause size="8vw" />;
  if (labelLower.includes('مربع')) return <Square size="8vw" />;
  if (labelLower.includes('دائره_شكل')) return <Circle size="8vw" />;
  if (labelLower.includes('مثلث')) return <Triangle size="8vw" />;
  if (labelLower.includes('سداسي')) return <Hexagon size="8vw" />;
  if (labelLower.includes('خماسي')) return <Pentagon size="8vw" />;
  if (labelLower.includes('ثماني')) return <Octagon size="8vw" />;
  if (labelLower.includes('ابتسامه')) return <Smile size="8vw" />;
  if (labelLower.includes('حزن')) return <Frown size="8vw" />;
  if (labelLower.includes('عادي')) return <Meh size="8vw" />;
  if (labelLower.includes('غضب')) return <Angry size="8vw" />;
  if (labelLower.includes('ضحك')) return <Laugh size="8vw" />;
  if (labelLower.includes('شبح')) return <Ghost size="8vw" />;
  if (labelLower.includes('جمجمه')) return <Skull size="8vw" />;
  if (labelLower.includes('تاج')) return <Crown size="8vw" />;
  if (labelLower.includes('جوهره')) return <Gem size="8vw" />;
  if (labelLower.includes('ميداليه')) return <Medal size="8vw" />;
  if (labelLower.includes('جائزه')) return <Award size="8vw" />;
  if (labelLower.includes('وسام')) return <Badge size="8vw" />;
  if (labelLower.includes('صح')) return <Check size="8vw" />;
  if (labelLower.includes('ناقص')) return <Minus size="8vw" />;
  if (labelLower.includes('زائد')) return <Plus size="8vw" />;
  if (labelLower.includes('يساوي')) return <Equal size="8vw" />;
  if (labelLower.includes('قسمه')) return <Divide size="8vw" />;
  if (labelLower.includes('نسبه')) return <Percent size="8vw" />;
  if (labelLower.includes('هاشتاق')) return <Hash size="8vw" />;
  if (labelLower.includes('ات')) return <AtSign size="8vw" />;
  if (labelLower.includes('امر')) return <Command size="8vw" />;
  if (labelLower.includes('خيار')) return <Option size="8vw" />;
  if (labelLower.includes('اعلى')) return <ArrowUp size="8vw" />;
  if (labelLower.includes('اسفل')) return <ArrowDown size="8vw" />;
  if (labelLower.includes('يسار')) return <ArrowLeft size="8vw" />;
  if (labelLower.includes('يمين')) return <ArrowRight size="8vw" />;
  if (labelLower.includes('تخطيط')) return <Layout size="8vw" />;
  if (labelLower.includes('اعمده')) return <Columns size="8vw" />;
  if (labelLower.includes('صفوف')) return <Rows size="8vw" />;
  if (labelLower.includes('شبكه')) return <Grid size="8vw" />;
  if (labelLower.includes('قائمه')) return <List size="8vw" />;
  if (labelLower.includes('محاذاه_يسار')) return <AlignLeft size="8vw" />;
  if (labelLower.includes('محاذاه_وسط')) return <AlignCenter size="8vw" />;
  if (labelLower.includes('محاذاه_يمين')) return <AlignRight size="8vw" />;
  if (labelLower.includes('محاذاه_ضبط')) return <AlignJustify size="8vw" />;
  if (labelLower.includes('عريض')) return <Bold size="8vw" />;
  if (labelLower.includes('مائل')) return <Italic size="8vw" />;
  if (labelLower.includes('تحته_خط')) return <Underline size="8vw" />;
  if (labelLower.includes('مشطوب')) return <Strikethrough size="8vw" />;
  if (labelLower.includes('كود')) return <Code size="8vw" />;

  const iconPool = [
    <Sprout size="8vw" />, <Flower2Icon size="8vw" />, <TreesIcon2 size="8vw" />, <Leaf size="8vw" />,
    <FlaskConical size="8vw" />, <Bug size="8vw" />, <Droplets size="8vw" />,
    <Sun size="8vw" />, <Cloud size="8vw" />, <Wind size="8vw" />, <Mountain size="8vw" />,
    <InfinityIcon size="8vw" />, <Carrot size="8vw" />, <Hammer size="8vw" />,
    <Home size="8vw" />, <Palmtree size="8vw" />, <Shrub size="8vw" />, <Mountain size="8vw" />,
    <Pill size="8vw" />, <Scissors size="8vw" />, <Shovel size="8vw" />, <Wrench size="8vw" />,
    <Package size="8vw" />, <Store size="8vw" />, <Gift size="8vw" />, <TreePine size="8vw" />,
    <Cherry size="8vw" />, <Apple size="8vw" />, <Banana size="8vw" />, <Citrus size="8vw" />,
    <Wheat size="8vw" />, <Waves size="8vw" />, <Flame size="8vw" />, <Zap size="8vw" />,
    <Heart size="8vw" />, <Star size="8vw" />, <Globe size="8vw" />, <Compass size="8vw" />,
    <Map size="8vw" />, <Anchor size="8vw" />, <Bike size="8vw" />, <Car size="8vw" />,
    <Plane size="8vw" />, <Train size="8vw" />, <Music size="8vw" />, <Video size="8vw" />,
    <Mic size="8vw" />, <Headphones size="8vw" />, <Book size="8vw" />, <Pen size="8vw" />,
    <Palette size="8vw" />, <Gamepad size="8vw" />, <Trophy size="8vw" />, <Target size="8vw" />,
    <Flag size="8vw" />, <Coffee size="8vw" />, <Utensils size="8vw" />, <GlassWater size="8vw" />,
    <Pizza size="8vw" />, <IceCream size="8vw" />, <Cake size="8vw" />, <Cookie size="8vw" />,
    <Candy size="8vw" />, <Egg size="8vw" />, <Fish size="8vw" />, <Bone size="8vw" />,
    <PawPrint size="8vw" />, <Bird size="8vw" />, <Rabbit size="8vw" />, <Turtle size="8vw" />,
    <Snail size="8vw" />, <Shell size="8vw" />, <Feather size="8vw" />, <Umbrella size="8vw" />,
    <Tent size="8vw" />, <Binoculars size="8vw" />, <Telescope size="8vw" />, <Microscope size="8vw" />,
    <Stethoscope size="8vw" />, <Activity size="8vw" />, <HeartPulse size="8vw" />, <Thermometer size="8vw" />,
    <CloudLightning size="8vw" />, <CloudRain size="8vw" />, <CloudSnow size="8vw" />, <Moon size="8vw" />,
    <Sunrise size="8vw" />, <Sunset size="8vw" />, <Rainbow size="8vw" />, <Sparkles size="8vw" />,
    <Shield size="8vw" />, <Key size="8vw" />, <LockKeyhole size="8vw" />, <Eye size="8vw" />,
    <Fingerprint size="8vw" />, <Cpu size="8vw" />, <HardDrive size="8vw" />, <Database size="8vw" />,
    <Server size="8vw" />, <Monitor size="8vw" />, <Laptop size="8vw" />, <Tablet size="8vw" />,
    <Printer size="8vw" />, <Mouse size="8vw" />, <Keyboard size="8vw" />, <Speaker size="8vw" />,
    <Tv size="8vw" />, <Radio size="8vw" />, <Cast size="8vw" />, <Wifi size="8vw" />,
    <Bluetooth size="8vw" />, <Battery size="8vw" />, <Plug size="8vw" />, <Lightbulb size="8vw" />,
    <Flashlight size="8vw" />, <Calculator size="8vw" />, <Calendar size="8vw" />, <Mail size="8vw" />,
    <Inbox size="8vw" />, <Send size="8vw" />, <Archive size="8vw" />, <HardHat size="8vw" />,
    <Construction size="8vw" />, <Truck size="8vw" />, <Bus size="8vw" />, <Ship size="8vw" />,
    <TramFront size="8vw" />, <CableCar size="8vw" />, <MountainSnow size="8vw" />, <TreeDeciduous size="8vw" />,
    <Clover size="8vw" />, <Flower size="8vw" />, <Dna size="8vw" />, <Atom size="8vw" />,
    <Magnet size="8vw" />, <GraduationCap size="8vw" />, <School size="8vw" />, <Library size="8vw" />,
    <Church size="8vw" />, <Hotel size="8vw" />, <Hospital size="8vw" />, <Factory size="8vw" />,
    <Warehouse size="8vw" />, <ShoppingBag size="8vw" />, <Tag size="8vw" />, <Ticket size="8vw" />,
    <Wallet size="8vw" />, <Coins size="8vw" />, <Banknote size="8vw" />, <Receipt size="8vw" />,
    <BarChart size="8vw" />, <PieChart size="8vw" />, <LineChart size="8vw" />, <AreaChart size="8vw" />,
    <Presentation size="8vw" />, <Languages size="8vw" />, <MessageSquare size="8vw" />, <MessageCircle size="8vw" />,
    <Phone size="8vw" />, <Share2 size="8vw" />, <ExternalLink size="8vw" />, <Link size="8vw" />,
    <Paperclip size="8vw" />, <Bookmark size="8vw" />, <StickyNote size="8vw" />, <Folder size="8vw" />,
    <File size="8vw" />, <Files size="8vw" />, <Image size="8vw" />, <Play size="8vw" />,
    <Pause size="8vw" />, <Square size="8vw" />, <Circle size="8vw" />, <Triangle size="8vw" />,
    <Hexagon size="8vw" />, <Pentagon size="8vw" />, <Octagon size="8vw" />, <Smile size="8vw" />,
    <Frown size="8vw" />, <Meh size="8vw" />, <Angry size="8vw" />, <Laugh size="8vw" />,
    <Ghost size="8vw" />, <Skull size="8vw" />,
    <Crown size="8vw" />, <Gem size="8vw" />, <Medal size="8vw" />, <Award size="8vw" />,
    <Badge size="8vw" />, <Check size="8vw" />, <Minus size="8vw" />, <Plus size="8vw" />,
    <Equal size="8vw" />, <Divide size="8vw" />, <Percent size="8vw" />, <Hash size="8vw" />,
    <AtSign size="8vw" />, <Command size="8vw" />, <Option size="8vw" />,
    <ArrowUp size="8vw" />, <ArrowDown size="8vw" />, <ArrowLeft size="8vw" />, <ArrowRight size="8vw" />,
    <Layout size="8vw" />, <Columns size="8vw" />, <Rows size="8vw" />, <Grid size="8vw" />,
    <List size="8vw" />, <AlignLeft size="8vw" />, <AlignCenter size="8vw" />, <AlignRight size="8vw" />,
    <AlignJustify size="8vw" />, <Bold size="8vw" />, <Italic size="8vw" />, <Underline size="8vw" />,
    <Strikethrough size="8vw" />, <Code size="8vw" />
  ];

  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = ((hash << 5) - hash) + label.charCodeAt(i);
    hash |= 0; 
  }
  const poolIndex = Math.abs(hash) % iconPool.length;
  
  return iconPool[poolIndex];
};
