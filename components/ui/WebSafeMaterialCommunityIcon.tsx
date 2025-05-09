import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function WebSafeMaterialCommunityIcon(props: any) {
  return (
    <MaterialCommunityIcons
      {...props}
      style={[
        props.style,
        Platform.OS === 'web' && { fontFamily: 'MaterialCommunityIcons' }
      ]}
    />
  );
} 