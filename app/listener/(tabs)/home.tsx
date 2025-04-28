import { View, ScrollView, Text, StyleSheet, ImageBackground, Dimensions, Pressable } from 'react-native'
import { Link } from 'expo-router'

import Post from '@/components/Post';
import { ThemedText } from '@/components/ThemedText';

import content from '../../../data/content.json';

const { width } = Dimensions.get('window');

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZ9Xhfzr5FCtVeBZBFu-JbhCDdxV--xaw",
  authDomain: "interlude-5d3bf.firebaseapp.com",
  projectId: "interlude-5d3bf",
  storageBucket: "interlude-5d3bf.firebasestorage.app",
  messagingSenderId: "634050795095",
  appId: "1:634050795095:web:958f17fe7ee74615483512",
  measurementId: "G-MQP660763F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const App = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <ImageBackground
          source={require('../../../assets/images/interlude_logo.png')}
          style={styles.homeLogo}
        ></ImageBackground>
      </View>
      <View style={styles.postsContainer}>
        <ThemedText type='large'>Feed</ThemedText>
        {content.map((item) => (
          <Post content={item}/>
        ))}
      </View>
    </ScrollView>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingLeft: 24,
    paddingRight: 24
  },
  containerTitle: {
    color: 'white',
    fontSize: 20
  },
  logoContainer: {
    height: 45,
    marginBottom: 24
  },
  postsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 48
  },
  homeLogo: {
  },
  image: {
    width: width,
    height: "50%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover'
  },
  title: {
    color: 'white',
    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
    padding: 4,
    marginBottom: 120,
  },
  button: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 6
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4,
  }
})