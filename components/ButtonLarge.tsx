import { PropsWithChildren } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

function ButtonLarge({ onPress, title }: PropsWithChildren & { onPress: () => void, title: string }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <ThemedText type='large'>{title}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.blue,
    height: 48,
    width: 272,
    padding: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonLarge