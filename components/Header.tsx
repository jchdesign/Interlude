import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors, hexToRgba } from '@/constants/Colors';

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
        backgroundColor: hexToRgba(Colors.dark.shayla, 0.5),
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingRight: 16
    },
    headerText: {
        fontSize: 32,
        fontWeight: '600',
        fontStyle: 'italic'
    }
});