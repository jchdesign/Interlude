import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
type Props = { text: string };

export function BackHeader({ text }: Props) {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Pressable onPress={() => router.back()} style={styles.arrowContainer} hitSlop={10}>
                <Ionicons name="chevron-back" size={24} color={Colors.dark.shayla} />
            </Pressable>
            <View style={styles.textContainer}>
                <ThemedText type='h3'>{text}</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.background,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
        paddingVertical: 12,
        position: 'relative',
    },
    arrowContainer: {
        zIndex: 2,
        height: '100%',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});