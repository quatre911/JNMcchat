const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Fonction pour envoyer notifications push à tous les utilisateurs
exports.sendNewMessageNotification = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();

    // Récupère tous les tokens FCM sauf celui de l'émetteur
    const usersSnap = await db.collection("users").get();
    const tokens = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken && data.uid !== message.uid) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    // Payload de la notification
    const payload = {
      notification: {
        title: `${message.name} a envoyé un message`,
        body: message.text,
        click_action: "https://TON_SITE_NETLIFY.netlify.app", // Remplace par ton URL Netlify
      }
    };

    // Envoi notification
    try {
      await admin.messaging().sendToDevice(tokens, payload);
      console.log("Notifications envoyées !");
    } catch (err) {
      console.error("Erreur envoi notifications :", err);
    }
    return null;
  });
