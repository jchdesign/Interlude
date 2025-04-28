import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ButtonNav from '@/components/ButtonNav';
import { router } from 'expo-router';
import { useState } from 'react';
import { updateProfileFields } from '@/firestore';
import { Colors } from '@/constants/Colors';
import ThemedInput from '@/components/ThemedInput';

export default function BirthdayScreen() {
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateAndFormatDate = (dateStr: string): Date | null => {
    // Remove any non-numeric characters
    const cleaned = dateStr.replace(/\D/g, '');
    
    if (cleaned.length !== 8) return null;

    const month = parseInt(cleaned.substring(0, 2));
    const day = parseInt(cleaned.substring(2, 4));
    const year = parseInt(cleaned.substring(4, 8));

    // Basic validation
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;

    const date = new Date(year, month - 1, day);
    
    // Check if it's a valid date (e.g., not Feb 31)
    if (date.getMonth() !== month - 1) return null;
    
    return date;
  };

  const formatInput = (input: string) => {
    // Remove any non-numeric characters
    const cleaned = input.replace(/\D/g, '');
    
    // Add slashes as they type
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 2) + ' / ' + 
                 cleaned.substring(2, 4) + ' / ' + 
                 cleaned.substring(4, 8);
    } else if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + ' / ' + 
                 cleaned.substring(2, 4);
    } else {
      formatted = cleaned;
    }
    
    return formatted;
  };

  const handleNext = async () => {
    const date = validateAndFormatDate(birthday);
    if (!date) {
      setError('Please enter a valid date in MM/DD/YYYY format');
      return;
    }

    try {
      await updateProfileFields({
        birthday: date,
      });
      router.push('/(onboarding)/listener/location' as const);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile information. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="h1" style={styles.titlePadding}>When's your birthday?</ThemedText>
      
      <View style={styles.inputContainer}>
        <ThemedInput
          placeholder="MM / DD / YYYY"
          value={birthday}
          onChangeText={(text) => {
            setBirthday(formatInput(text));
            setError(null);
          }}
          keyboardType="numeric"
          maxLength={14} // MM / DD / YYYY = 14 characters
        />
        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}
      </View>

      <View style={styles.navigation}>
        <ButtonNav onPress={() => router.back()} forward={false} />
        <ButtonNav onPress={handleNext} forward={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  titlePadding: {
    paddingBottom: 20,
  },
  errorText: {
    color: Colors.dark.error,
    marginTop: 8,
  },
}); 