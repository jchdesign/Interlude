import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';

interface FilteredGridProps<T> {
  data: T[];
  selectedItems: string[];
  onItemSelect: (id: string) => void;
  type: 'genre' | 'mood';
  columns?: number;
  renderLabel: (item: T) => string;
  getId: (item: T) => string;
}

export function FilteredGrid<T>({
  data,
  selectedItems,
  onItemSelect,
  type,
  columns = 2,
  renderLabel,
  getId
}: FilteredGridProps<T>) {
  const renderItem = ({ item }: { item: T }) => {
    const id = getId(item);
    const isSelected = selectedItems.includes(id);
    const backgroundColor = type === 'genre' ? Colors.dark.blue : Colors.dark.shayla;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { backgroundColor },
          { opacity: isSelected ? 1 : 0.5 },
          isSelected && styles.selectedItem
        ]}
        onPress={() => onItemSelect(id)}
      >
        <ThemedText style={styles.itemText}>
          {renderLabel(item)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => getId(item)}
      numColumns={columns}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: Colors.dark.white,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 16,
  },
}); 