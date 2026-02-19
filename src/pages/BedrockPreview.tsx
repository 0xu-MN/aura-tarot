import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// @ts-ignore
import { Route } from '@bedrock-pages/home';

export default function BedrockPreview() {
    const HomePage = Route.component;
    return (
        <View style={styles.container}>
            <View style={styles.statusBar}>
                <Text style={styles.statusText}>Bedrock Web Preview</Text>
            </View>
            <View style={styles.appContainer}>
                {HomePage && <HomePage />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    statusBar: {
        height: 44,
        backgroundColor: '#1a1b1e',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    statusText: {
        color: '#DAA520',
        fontSize: 12,
        fontWeight: 'bold',
    },
    appContainer: {
        flex: 1,
    }
});
