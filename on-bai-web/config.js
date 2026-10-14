// Cấu hình Firebase với API Key mới
const firebaseConfig = {
  apiKey: "AIzaSyCO0xRuMAL2--S5Fn9-efm5T8HWqG-GvcI",
  authDomain: "thisang-6c208.firebaseapp.com",
  projectId: "thisang-6c208",
  storageBucket: "thisang-6c208.firebasestorage.app",
  messagingSenderId: "241456699320",
  appId: "1:241456699320:web:d74bd3d11b8b2848ca9a6e"
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
