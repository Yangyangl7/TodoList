import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyC8BQqCx0FsF3Ws4mGIC-kbXhJQJslQGfg",
    authDomain: "cs5117-hwk2-yang.firebaseapp.com",
    databaseURL: "https://cs5117-hwk2-yang.firebaseio.com",
    projectId: "cs5117-hwk2-yang",
    storageBucket: "cs5117-hwk2-yang.appspot.com",
    messagingSenderId: "295465251341"
  };
  firebase.initializeApp(config);

  const db = firebase.firestore();
  
  const settings = { timestampsInSnapshots: true };
  db.settings(settings);
  
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  
  export { db, auth, provider };
