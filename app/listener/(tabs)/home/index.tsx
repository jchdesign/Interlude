import { View, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firestore'
import { useRouter } from 'expo-router'
import { getFirestore } from 'firebase/firestore'
import { ChevronRightIcon } from 'react-native-heroicons/outline'

import PostContainer from '@/components/PostContainer'
import { ThemedText } from '@/components/ThemedText'
import MusicCard from '@/components/MusicCard'

const { width: screenWidth } = Dimensions.get('window')

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
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchFollowingFriendsFansAndPosts = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        // Get following list
        const followingQuery = query(collection(db, 'following'), where('follower_id', '==', user.uid))
        const followingSnapshot = await getDocs(followingQuery)
        const following = followingSnapshot.docs.map(doc => doc.data().following_id)
        setFollowingIds(following)

        // Get friends list
        const friendsQuery = query(collection(db, 'friends'), where('users', 'array-contains', user.uid))
        const friendsSnapshot = await getDocs(friendsQuery)
        const friends = friendsSnapshot.docs.map(doc => {
          const users = doc.data().users
          return users.find((id: string) => id !== user.uid)
        })
        setFriendIds(friends)

        // Get fan (artist) ids
        const fansQuery = query(collection(db, 'fans'), where('listener_id', '==', user.uid))
        const fansSnapshot = await getDocs(fansQuery)
        const fanArtistIds = fansSnapshot.docs.map(doc => doc.data().artist_id)

        // Combine following, friends, and fan artist ids
        const allIds = [...new Set([...following, ...friends, ...fanArtistIds])]

        // Get posts from following, friends, and fan artists
        let postsData: any[] = []
        if (allIds.length > 0) {
          // Firestore 'in' queries are limited to 10 elements
          const chunkSize = 10
          for (let i = 0; i < allIds.length; i += chunkSize) {
            const chunk = allIds.slice(i, i + chunkSize)
            const postsQuery = query(collection(db, 'posts'), where('user_id', 'in', chunk))
            const postsSnapshot = await getDocs(postsQuery)
            postsData = postsData.concat(postsSnapshot.docs.map(doc => doc.data()))
          }
        }
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching following, friends, fans and posts:', error)
      }
    }

    fetchFollowingFriendsFansAndPosts()
  }, [])

  useEffect(() => {
    // Fetch 5 random songs for daily recommendations
    const fetchRecommendations = async () => {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'songs'));
        const allSongs = snapshot.docs.map(doc => doc.id);
        // Shuffle and pick 5
        for (let i = allSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }
        setRecommendations(allSongs.slice(0, 5));
      } catch (e) {
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/images/interlude_logo.png')}
          style={styles.homeLogo}
          resizeMode="contain"
        />
      </View>
      {/* Daily Recommendations Section */}
      <View style={styles.recommendationsSection}>
        <TouchableOpacity style={styles.recommendationsHeader} onPress={() => router.push('./home/daily-recommendations')}>
          <ThemedText type='large' style={styles.recommendationsTitle}>Daily Recommendations</ThemedText>
          <ChevronRightIcon size={26} color={Colors.dark.white} style={styles.chevron} />
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
          {recommendations.map(songId => (
            <MusicCard key={songId} songId={songId} square={true} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.postsContainer}>
        <ThemedText type='large'>Feed</ThemedText>
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
  containerTitle: {
    color: 'white',
    fontSize: 20
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  postsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 48
  },
  homeLogo: {
    height: 52,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  image: {
    width: screenWidth,
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
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationsTitle: {
    color: Colors.dark.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  chevron: {
    color: Colors.dark.white,
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  recommendationsScroll: {
    flexDirection: 'row',
    marginTop: 10,
  },
})