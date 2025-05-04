import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { View, StyleSheet, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import ButtonLarge from '@/components/ButtonLarge';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import ThemedInput from '@/components/ThemedInput';
import { createUserProfile } from '@/firestore';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firestore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(email, password);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No user found after login');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) throw new Error('User profile not found');
      const userData = userDoc.data();
      if (userData.role === 'artist') {
        router.push('/artist/(tabs)/home');
      } else if (userData.role === 'listener') {
        router.push('/listener/(tabs)/home');
      } else {
        alert('Unknown user role. Please contact support.');
      }
    } catch(e:any) {
      const err = e as FirebaseError;
      alert("Login Failed: " +  err.message);
    } finally {
      setLoading(false)
    }
  }

  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(email, password);
      console.log('User created:', userCredential.user.uid);
      router.push('/(auth)/user-type');
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <View style={{width: '100%', marginBottom: 24}}>
          <View style={styles.inputContainer}>
            <ThemedInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <ThemedInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
            />
          </View>
        </View>
        {
          loading ? (
            <ActivityIndicator size='small' style={{margin:28}}/>
          ):(
            <View style={{flexDirection: 'column', gap: 12}}>
              <ButtonLarge onPress={signUp} title='Sign Up'/>
              <ButtonLarge onPress={login} title='Log In'/>
            </View>
          )
        }
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    paddingBottom: 10,
    width: '100%',
  }
}) 