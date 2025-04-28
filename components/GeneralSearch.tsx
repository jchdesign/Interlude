import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';

interface GeneralSearchProps<T> {
  onSearch: (query: string) => Promise<T[]>;
  onResultsChange: (results: T[]) => void;
  initialData: T[];
  placeholder?: string;
  debounceMs?: number;
}

export function GeneralSearch<T>({ 
  onSearch, 
  onResultsChange, 
  initialData,
  placeholder = "Search...",
  debounceMs = 300 
}: GeneralSearchProps<T>) {
  const [searchText, setSearchText] = useState('');

  // Set initial data when component mounts
  useEffect(() => {
    onResultsChange(initialData);
  }, [initialData]);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.trim()) {
        const results = await onSearch(text);
        onResultsChange(results);
      } else {
        // When search is cleared, show all initial data
        onResultsChange(initialData);
      }
    }, debounceMs),
    [onSearch, onResultsChange, initialData]
  );

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={Colors.dark.textGrey} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.dark.textGrey}
          value={searchText}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.dark.darkGrey,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
  },
}); 