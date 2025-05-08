import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickImageOrVideo } from '@/storage'; // You need to implement this utility if not present
import { uploadPostMedia } from '@/storage'; // You need to implement this utility if not present
import { createPostFromTemporary } from '@/firestore';
import { Colors } from '@/constants/Colors';
import { useCreateMusic } from './CreateMusicContext';
import { Video, ResizeMode } from 'expo-av';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import MusicCard from '@/components/MusicCard';

export default function AddPost() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { postData, updatePostData, resetForm } = useCreateMusic();
  const [loading, setLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(postData.image || null);
  const [uploading, setUploading] = useState(false);

  const category = params.category ? String(params.category) : 'Behind the Scenes';
  const type = params.type ? String(params.type) : 'behind_scenes';

  const handleCaptionChange = (text: string) => {
    updatePostData({ blurb: text });
  };

  const handlePickMedia = async () => {
    setUploading(true);
    const uri = await pickImageOrVideo();
    if (uri) {
      setMediaPreview(uri);
      updatePostData({ image: uri });
    }
    setUploading(false);
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      // 1. Create the post in Firestore (get postId)
      const allowedTypes = ['behind_scenes', 'music', 'playlist', 'live_event', 'merch'] as const;
      type PostType = typeof allowedTypes[number];
      const safeType = allowedTypes.includes(type as PostType) ? (type as PostType) : 'behind_scenes';
      const postDoc = await createPostFromTemporary({
        type: safeType,
        category,
        content: postData.blurb,
        media: '', // will update after upload
        ...(postData.tag ? { tag: postData.tag } : {}),
      });
      const postId = postDoc.post_id;
      let mediaUrl = '';
      // 2. Upload media if present (only now)
      const imageToUpload = postData.image ?? '';
      if (typeof imageToUpload === 'string' && imageToUpload !== '') {
        mediaUrl = await uploadPostMedia(imageToUpload, postId);
      }
      // 3. Update post doc with media URL
      if (mediaUrl) {
        // Use Firestore updateDoc instead of createPostFromTemporary
        const db = getFirestore();
        await updateDoc(doc(db, 'posts', postId), { media: mediaUrl });
      }
      setLoading(false);
      resetForm();
      router.back();
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'There was a problem posting your BTS post.');
      console.error(error);
    }
  };

  return (
    <View style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { resetForm(); router.back(); }}>
          <ThemedText type='h3' style={{color: Colors.dark.shayla}}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          <ThemedText type='h3' style={{color: Colors.dark.shayla}}>Post</ThemedText>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color={Colors.dark.shayla} style={{ marginBottom: 16 }} />}

      <ThemedText type='h1' style={{marginBottom: 40}}>{category.replace(/\b\w/g, l => l.toUpperCase())}</ThemedText>

      {/* Caption */}
      <View style={styles.formGroup}>
        <ThemedText type='large' style={styles.label}>Caption</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Add a caption"
          placeholderTextColor={Colors.dark.textGrey}
          value={postData.blurb}
          onChangeText={handleCaptionChange}
          multiline
        />
      </View>

      {/* Media */}
      <View style={styles.formGroup}>
        <ThemedText type='large' style={styles.label}>Media</ThemedText>
        <TouchableOpacity style={styles.uploadInput} onPress={handlePickMedia} disabled={uploading}>
          <MaterialCommunityIcons name="plus" size={32} color={Colors.dark.shayla} />
          <ThemedText type='h3' style={{color: Colors.dark.textGrey}}> Add Media</ThemedText>
        </TouchableOpacity>
        {uploading && <ActivityIndicator size="small" color={Colors.dark.pink} style={{ marginTop: 12 }} />}
        {mediaPreview && !uploading && (
          mediaPreview.match(/\.(mp4|mov|avi|mkv|webm)$/i)
            ? <Video source={{ uri: mediaPreview }} style={styles.mediaPreview} useNativeControls resizeMode={ResizeMode.COVER} />
            : <Image source={{ uri: mediaPreview }} style={styles.mediaPreview} />
        )}
      </View>

      {/* Show selected music if type is music */}
      <View style={styles.flexGrow} />
      {postData.type === 'music' && postData.tag && (
        <View style={styles.selectedMusicSection}>
          <ThemedText type='large' style={{ marginBottom: 8, alignSelf: 'flex-start' }}>Selected Music</ThemedText>
          <MusicCard songId={postData.tag} profile={true} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  formGroup: {
    gap: 12,
    marginBottom: 24,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    color: Colors.dark.white,
    backgroundColor: 'transparent',
    fontSize: 16,
    paddingVertical: 2,
    minHeight: 150,
  },
  uploadInput: {
    borderWidth: 1,
    borderColor: Colors.dark.textGrey,
    borderRadius: 50,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadInputText: {
    color: Colors.dark.pink,
    fontSize: 16,
    marginLeft: 8,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'cover',
  },
  flexGrow: {
    flex: 1,
  },
  selectedMusicSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
}); 