import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";

// Read configuration from Vite environment variables with developer fallback values
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_YOUR_FIREBASE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined;

let messagingInstance: Messaging | null = null;

export const initFirebaseMessaging = async (): Promise<string | null> => {
  console.log("[FCM] Initializing Firebase Messaging...");

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("[FCM] Firebase Messaging is not supported in this browser environment.");
      return null;
    }

    // Initialize Firebase App
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    messagingInstance = getMessaging(app);

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      console.log("[FCM] Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log(`[FCM] Notification permission status: ${permission}`);

      if (permission !== "granted") {
        console.warn("[FCM] Notification permission was denied or dismissed by the user.");
        return null;
      }
    }

    // Register service worker if available
    let swRegistration: ServiceWorkerRegistration | undefined = undefined;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("[FCM] Service Worker registered successfully with scope:", swRegistration.scope);
      } catch (swErr) {
        console.warn("[FCM] Service Worker registration failed:", swErr);
      }
    }

    // Retrieve FCM Registration Token
    console.log("[FCM] Fetching FCM Registration Token...");
    const token = await getToken(messagingInstance, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("==================================================");
      console.log("FCM REGISTRATION TOKEN:");
      console.log(token);
      console.log("==================================================");

      // Listen for foreground notifications
      onMessage(messagingInstance, (payload) => {
        console.log("[FCM] Foreground notification received:", payload);
      });

      return token;
    } else {
      console.warn("[FCM] No registration token available. Request permission or check configuration.");
      return null;
    }
  } catch (error: any) {
    console.error("[FCM] Error initializing Firebase Messaging or getting token:", error);
    return null;
  }
};

export const getMessagingInstance = (): Messaging | null => messagingInstance;
