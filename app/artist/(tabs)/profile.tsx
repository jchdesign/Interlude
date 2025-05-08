import { getAuth } from 'firebase/auth';
import { ArtistProfile } from '@/components/ArtistProfile';

export default function Profile() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return <ArtistProfile userId={user.uid} isOwnProfile={true} />;
}
