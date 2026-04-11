import { createRoute } from '@granite-js/react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export const Route = createRoute('/ai-today-one-card', {
    component: EntryPage,
});

function EntryPage() {
    const navigation = Route.useNavigation();

    useEffect(() => {
        navigation.replace('/');
    }, []);

    return <View style={{ flex: 1, backgroundColor: '#0a0a0b' }} />;
}