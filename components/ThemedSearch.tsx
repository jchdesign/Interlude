import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';

interface ThemedSearchProps<T> {
  placeholder?: string;
  onSearch: (query: string) => Promise<T[]>;
  onItemSelect: (item: T) => void;
  value?: string;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  maxHeight?: number;
  debounceTime?: number;
}

export interface ThemedSearchRef {
  clearSearch: () => void;
}

export const ThemedSearch = forwardRef<ThemedSearchRef, ThemedSearchProps<any>>((props, ref) => {
  const {
    placeholder = 'Search...',
    onSearch,
    onItemSelect,
    value,
    renderItem,
    keyExtractor,
    maxHeight = 200,
    debounceTime = 300,
  } = props;

  const [searchQuery, setSearchQuery] = useState(value || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
      setResults([]);
    }
  }));

  // Update searchQuery when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceTime]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(debouncedQuery);
        console.log('Search results:', searchResults);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, onSearch]);

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.default]}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.textGrey}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (!text.trim()) {
            setResults([]);
          }
        }}
      />
      
      {searchQuery.trim() !== '' && !value && (
        <View style={[styles.resultsContainer, { maxHeight }]}>
          {isLoading ? (
            <View style={styles.resultItem}>
              <ThemedText>Searching...</ThemedText>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => {
                    console.log('Selected item:', item);
                    onItemSelect(item);
                    setResults([]);
                  }}
                >
                  {renderItem(item)}
                </TouchableOpacity>
              )}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.resultItem}>
              <ThemedText>No results found</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.purple,
    marginBottom: 10,
    position: 'relative',
  },
  input: {
    color: Colors.dark.text,
    paddingVertical: 8,
    width: '100%',
    zIndex: 1,
  },
  default: {
    fontSize: 24,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.purple,
    borderRadius: 8,
    marginTop: 2,
    zIndex: 99999,
    elevation: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.purple,
    backgroundColor: Colors.dark.background,
  },
}); 