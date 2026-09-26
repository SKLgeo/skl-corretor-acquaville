// Notificação push pelo link/PWA (Web Push via Firebase Cloud Messaging) — só
// faz sentido num navegador de verdade; o app Android nativo já tem seu
// próprio jeito de notificar (window.NativeBridge.requestPushToken).
// Genérico por design: reaproveita window.SKLPush.onToken (o mesmo caminho que
// o app nativo já usa) e o link que a notificação abre vem de
// empreendimentos.config.links_web — nada aqui é específico do Acquaville.
(() => {
  "use strict";
  if (window.NativeBridge) return;
  if (!("serviceWorker" in navigator) || !("Notification" in window) || !location.protocol.startsWith("http")) return;

  const firebaseConfig = {
    apiKey: "AIzaSyDAi87BQ_wf9gDn5H-Khqyl4cKf72UnmO4",
    authDomain: "app-impreendimentos.firebaseapp.com",
    projectId: "app-impreendimentos",
    storageBucket: "app-impreendimentos.firebasestorage.app",
    messagingSenderId: "525989169956",
    appId: "1:525989169956:web:f4a9329652d0367dd441b1",
  };
  const VAPID_KEY = "BK7NBwuwSb5ExS5SCnEkkkMeCnFCVHW_JWkTKuU0puBUXANFMCi2WulFTsNCcgfvrh8M8AIKhunTayGZw9kSUFs";

  let iniciado = false;

  async function registrar() {
    if (iniciado) return;
    if (!window.firebase || Notification.permission === "denied") return;
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") return;

      if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();
      const registration = await navigator.serviceWorker.register("./sw.js");
      const token = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) return;

      await window.SKLPush?.onToken(token, "web");
      iniciado = true;
    } catch (error) {
      console.error("Falha ao registrar push web:", error);
    }
  }

  window.SKLPushWeb = { registrar };
})();
