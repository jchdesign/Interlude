import React from 'react';
import { ScrollView, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type Props = {images: string[]}

export function ImageCarousel({images} : Props) {
    return (
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.container}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            resizeMode="cover"
            style={styles.image}
          />
        ))}
      </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
      width: width,
      height: 600,
    },
    image: {
      width: width,
      height: 600,
    },
});