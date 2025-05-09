import { View, ScrollView, StyleSheet, ImageBackground, Dimensions } from 'react-native'
import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firestore'

import PostContainer from '@/components/PostContainer'
import { ThemedText } from '@/components/ThemedText'

const { width } = Dimensions.get('window')

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Colors } from '@/constants/Colors'
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

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    const fetchFollowingAndPosts = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        // Get following list
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', user.uid))
        const followingSnapshot = await getDocs(followingQuery)
        const following = followingSnapshot.docs.map(doc => doc.data().following_id)
        setFollowingIds(following)

        // Get posts from following
        const postsQuery = query(collection(db, 'posts'), where('user_id', 'in', following))
        const postsSnapshot = await getDocs(postsQuery)
        const postsData = postsSnapshot.docs.map(doc => doc.data())

        // Get user's own posts
        const userPostsQuery = query(collection(db, 'posts'), where('user_id', '==', user.uid))
        const userPostsSnapshot = await getDocs(userPostsQuery)
        const userPostsData = userPostsSnapshot.docs.map(doc => doc.data())

        // Combine user's posts at the top
        setPosts([...userPostsData, ...postsData])
      } catch (error) {
        console.error('Error fetching following and posts:', error)
      }
    }

    fetchFollowingAndPosts()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <ImageBackground
          source={require('../../../assets/images/interlude_logo.png')}
          style={styles.homeLogo}
        ></ImageBackground>
      </View>
      <View style={styles.postsContainer}>
        <PostContainer posts={posts} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 24,
    backgroundColor: Colors.dark.background
  },
  logoContainer: {
    height: 50,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 48
  },
  homeLogo: {
    width: '70%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
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