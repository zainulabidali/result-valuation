// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBPJoxeLHOQk4j_7HE1hXRUunzY91CQY0",
  authDomain: "competition-score-entry.firebaseapp.com",
  projectId: "competition-score-entry",
  storageBucket: "competition-score-entry.appspot.com",
  messagingSenderId: "1018065208211",
  appId: "1:1018065208211:web:ba616a7697f61bc2c15e66"
};

export const app = initializeApp(firebaseConfig);
