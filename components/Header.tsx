import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

type Props = {text: string}

export function Header({text} : Props) {
    return (
        <View style={styles.container}>
            <ThemedText style={styles.headerText}>{text}</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#78376299',
        flexDirection: 'row',
        alignSelf: 'flex-start'
    },
    headerText: {
        fontSize: 32,
        fontWeight: '600',
        fontStyle: 'italic'
    }
});