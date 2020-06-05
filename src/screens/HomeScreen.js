import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const HomeScreen = () => {
    return(
        <View style={styles.container}>
            <Text>Home screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default HomeScreen;