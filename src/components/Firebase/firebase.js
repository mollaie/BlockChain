import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  };



  
class Firebase {
    constructor() {
      app.initializeApp(config);


      this.auth = app.auth();
      this.db = app.database();
    }

     // *** Auth API ***

     doCreateUserWithEmailAndPassword = (email, password) =>
     this.auth.createUserWithEmailAndPassword(email, password);
 
 
     doSignInWithEmailAndPassword = (email, password) =>
     this.auth.signInWithEmailAndPassword(email, password);
 
     doSignOut = () => this.auth.signOut();
 
     doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
     doPasswordUpdate = password =>
       this.auth.currentUser.updatePassword(password);
    
     getUserByEmail = (email)=> app.auth().getUserByEmail(email);


       // *** User API ***
 
     user = uid => this.db.ref(`users/${uid}`);
     currentUser =() => app.auth().currentUser; 
    
  }


      
  export default Firebase;
  