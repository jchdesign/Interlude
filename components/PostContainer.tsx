import React from 'react';
import { View, StyleSheet } from 'react-native';
import Post from './Post';
import { Colors } from '@/constants/Colors';

interface PostContainerProps {
  posts: any[];
  filter?: (post: any) => boolean;
}

const PostContainer: React.FC<PostContainerProps> = ({ posts, filter }) => {
  // First filter the posts if a filter function is provided
  const filteredPosts = filter ? posts.filter(filter) : posts;
  
  // Then sort the posts by date in ascending order (earliest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at);
    const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime(); // Reversed order to show earliest first
  });

  return (
    <View style={styles.container}>
      {sortedPosts.map((post, idx) => (
        <React.Fragment key={post.post_id}>
          <Post content={post} />
          {idx < sortedPosts.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.dark.textGrey,
    marginVertical: 16,
  },
});

export default PostContainer; 