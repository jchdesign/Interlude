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
        <ThemedText type="h3">
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
      columnWrapperStyle={{ columnGap: 24, ...styles.row }}
      contentContainerStyle={styles.grid}
      ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: Colors.dark.white,
  }
}); 