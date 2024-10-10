// /app/tabs/shorts.jsx
import React from 'react';
import { Text, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

const Shorts = () => {
    return (
        <ScreenWrapper>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Shorts Screen</Text>
            </View>
        </ScreenWrapper>
    );
};

export default Shorts;
