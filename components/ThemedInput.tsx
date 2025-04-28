import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';

interface ThemedInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  type?: 'default' | 'title' | 'small' | 'large' | 'h3' | 'h2' | 'h1' | 'link';
}

export default function ThemedInput({
  value,
  onChangeText,
  placeholder,
  type = 'default',
  ...props
}: ThemedInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          type === 'default' ? styles.default : undefined,
          // type === 'title' ? styles.title : undefined,
          // type === 'small' ? styles.small : undefined,
          // type === 'large' ? styles.large : undefined,
          // type === 'h3' ? styles.h3 : undefined,
          // type === 'h2' ? styles.h2 : undefined,
          // type === 'h1' ? styles.h1 : undefined,
          // type === 'link' ? styles.link : undefined,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textGrey}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.purple,
    marginBottom: 10,
  },
  input: {
    color: Colors.dark.text,
    paddingVertical: 8,
    width: '100%',
  },
  default: {
    fontSize: 24,
  }
  // small: {
  //   fontSize: 12,
  // },
  // large: {
  //   fontSize: 20,
  // },
  // h3: {
  //   fontSize: 20,
  //   fontWeight: '600',
  // },
  // h2: {
  //   fontSize: 24,
  //   fontWeight: '600',
  // },
  // h1: {
  //   fontSize: 32,
  //   fontWeight: '700',
  // },
  // title: {
  //   fontSize: 64,
  //   fontWeight: 'semibold',
  // },
  // link: {
  //   fontSize: 16,
  //   color: Colors.dark.purple,
  // },
}); 