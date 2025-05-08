import { useLocalSearchParams } from 'expo-router';
import { ArtistProfile } from '@/components/ArtistProfile';
import ListenerProfile from '@/components/ListenerProfile';
import { getAuth } from 'firebase/auth';
import { BackHeader } from '@/components/BackHeader';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firestore';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const auth = getAuth();
  const viewerId = auth.currentUser?.uid;
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', id as string));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || 'Profile');
          setUserRole(data.role || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName('Profile');
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  if (loading) return null;

  return (
    <>
      <BackHeader text={userName} />
      {userRole === 'artist' ? (
        <ArtistProfile userId={id as string} isOwnProfile={viewerId === id} viewerId={viewerId} />
      ) : userRole === 'listener' ? (
        <ListenerProfile userId={id as string} isOwnProfile={viewerId === id} viewerId={viewerId} />
      ) : null}
    </>
  );
}

export const options = {
  headerShown: false,
};