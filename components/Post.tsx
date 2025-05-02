import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
    content: any
}

export default function Post({ content }: Props) {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postInfo}>
        <Image
          style={styles.profilePicture}
          source={content.picture}
        />
        {/* <View style={styles.profilePicture}/> */}
        <ThemedText type='large'>{content.handle}</ThemedText>
        <ThemedText style={styles.time}>{content.time}</ThemedText>
      </View>
      <View style={styles.categoryTag}>
        <ThemedText style={styles.categoryTagText}>{content.category}</ThemedText>
      </View>
      <ThemedText>{content.caption}</ThemedText>
      <Image
        style={styles.mediaImage}
        source={{uri: content.media}}
      />
      <View style={styles.interactionBar}>
        <IconSymbol size={28} name="heart" color={'#D9D9D9'}/>
        <IconSymbol size={28} name="bubble.left" color={'#D9D9D9'}/>
        <IconSymbol size={28} name="paperplane" color={'#D9D9D9'}/>
        <IconSymbol size={28} name="repeat" color={'#D9D9D9'}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flexDirection: 'column',
    gap: 12,
    color: 'white'
  },
  postInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E1E1E1'
  },
  time: {
    width: '100%',
    color: '#C7C7C7',
    textAlign: 'right',
    fontSize: 12
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#D1A5D9'
  },
  categoryTagText: {
    fontSize: 12,
    color: '#D1A5D9'
  },
  caption: {
    fontSize: 16,
    color: '#E1E1E1'
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8C8C8C'
  },
  interactionBar: {
    flexDirection: 'row',
    gap: 10
  }
});