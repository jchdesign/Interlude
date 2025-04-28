import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface ButtonNavProps {
  onPress: () => void;
  forward: boolean;
}

export default function ButtonNav({ onPress, forward }: ButtonNavProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {forward ? (
        <IconSymbol name='arrow.right' color={Colors.dark.white}/>
      ) : (
        <IconSymbol name='arrow.left' color={Colors.dark.white}/>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: Colors.dark.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
});