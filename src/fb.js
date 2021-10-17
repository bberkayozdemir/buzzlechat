// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

//const app = () => !firebase.apps.length ? firebase :   firebase.initializeApp(firebaseConfig)
const app =  firebase.initializeApp(firebaseConfig)

const auth = app.auth();
const db = app.firestore();
const storage = app.storage()
//const messaging = firebase.messaging()

const signInWithEmailAndPassword = async (email, password) => {
    try {
      const res = await auth.signInWithEmailAndPassword(email, password);
      global.user = await getUserDatas(res.user.uid)
      savePushToken(user.uid, global.notificationToken)
      return true
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false
    }
};

const registerWithEmailAndPassword = async (name, surname, email, password) => {
    try {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      const user = res.user;
      global.user = await getUserDatas(res.user.uid)
      await db.collection("users").add({
        uid: user.uid,
        name,
        surname,
        username:name + " " + surname,
        authProvider: "local",
        email,
      });
      savePushToken(user.uid, global.notificationToken)
      return true
    } catch (err) {
      console.error(err);
      alert(err.message);
      return false
    }
};

const logout = async() => {
    await auth.signOut();
};

const getUserDatas = async (id) => {
  const res = await db.collection("users").where("uid", "==", id).get()
  var user;
  res.forEach((doc) => user = doc.data() )
  console.log(user)
  return user
}

const savePushToken = async (id, token) => {
  try{

    var res = await db.collection("users").where("uid", "==", id).get()
    var id;
    console.log("bruh1")
    res.forEach((doc) => id=doc.id )

    console.log(token)

    db.collection("users").doc(id).set(
      {
        pushToken:token
      },
      { merge:true}
    )

  }catch (err) {
    console.log(err)
  }
}

export {
    auth,
    db,
    storage,
    signInWithEmailAndPassword,
    registerWithEmailAndPassword,
    logout,
    getUserDatas,
    savePushToken
  };
