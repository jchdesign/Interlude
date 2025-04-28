import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword as webSignIn, createUserWithEmailAndPassword as webSignUp, onAuthStateChanged as webOnAuthStateChanged } from 'firebase/auth';
import rnAuth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBZ9Xhfzr5FCtVeBZBFu-JbhCDdxV--xaw",
  authDomain: "interlude-5d3bf.firebaseapp.com",
  projectId: "interlude-5d3bf",
  storageBucket: "interlude-5d3bf.firebasestorage.app",
  messagingSenderId: "634050795095",
  appId: "1:634050795095:web:958f17fe7ee74615483512",
  measurementId: "G-MQP660763F"
};

export const app = Platform.OS === 'web' ? initializeApp(firebaseConfig) : undefined;
const webAuth = Platform.OS === 'web' ? getAuth(app) : null;
const nativeAuth = Platform.OS === 'web' ? null : rnAuth();

export const signInWithEmailAndPassword = (email: string, password: string) => 
  Platform.OS === 'web' 
    ? webSignIn(webAuth!, email, password)
    : nativeAuth!.signInWithEmailAndPassword(email, password);

export const createUserWithEmailAndPassword = (email: string, password: string) =>
  Platform.OS === 'web'
    ? webSignUp(webAuth!, email, password)
    : nativeAuth!.createUserWithEmailAndPassword(email, password);

export const onAuthStateChanged = (callback: (user: any) => void) => {
  if (Platform.OS === 'web') {
    return webOnAuthStateChanged(webAuth!, callback);
  } else {
    return nativeAuth!.onAuthStateChanged(callback);
  }
};

export const auth = Platform.OS === 'web' ? webAuth : nativeAuth; 