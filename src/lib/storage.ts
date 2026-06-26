import { openDB, IDBPDatabase } from 'idb';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

const DB_NAME = 'ZoneAppDB';
const DB_VERSION = 1;

export interface Product {
  id: string;
  data: any[];
  lastUpdated: number;
}

export interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

export const isOnline = async () => {
  const status = await Network.getStatus();
  return status.connected;
};

export const saveProducts = async (products: any[]) => {
  const db = await getDB();
  const tx = db.transaction('products', 'readwrite');
  await tx.store.clear();
  for (let i = 0; i < products.length; i++) {
    await tx.store.put({ id: String(i), data: products[i], lastUpdated: Date.now() });
  }
  await tx.done;
  
  // Save last sync time in Preferences for Capacitor persistence
  await Preferences.set({
    key: 'last_sync_time',
    value: Date.now().toString()
  });
};

export const getProducts = async () => {
  const db = await getDB();
  const products = await db.getAll('products');
  return products.map(p => p.data);
};

export const saveMetadata = async (key: string, value: any) => {
  const db = await getDB();
  await db.put('metadata', { key, value });
  
  // Also mirror to Preferences for Capacitor-specific persistent settings
  await Preferences.set({
    key: `pref_${key}`,
    value: JSON.stringify(value)
  });
};

export const getMetadata = async (key: string) => {
  const db = await getDB();
  const entry = await db.get('metadata', key);
  if (entry) return entry.value;
  
  // Fallback to Preferences
  const { value } = await Preferences.get({ key: `pref_${key}` });
  return value ? JSON.parse(value) : null;
};

export const getCachedImage = async (url: string): Promise<string | null> => {
  if (!url) return null;
  const db = await getDB();
  const cached = await db.get('images', url);
  if (cached) {
    return URL.createObjectURL(cached.blob);
  }
  return null;
};

export const cacheImage = async (url: string, blob: Blob) => {
  const db = await getDB();
  await db.put('images', { url, blob, timestamp: Date.now() });
};
