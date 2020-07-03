import React from 'react';
import { View, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {connect} from "react-redux";
import theme from "../styles/theme.styles";
import { Feather } from '@expo/vector-icons'

const LoadingScreen = ({ ui }) => {

    return (
        <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
            { ui.isConnected ? (
                <>
                    <Image style={{width: "50%"}} resizeMode="contain" source={require('../../assets/logo.png')} />
                    <ActivityIndicator style={{position: 'absolute'}} size="large" color={theme.COLOR_LIGHTGREY} />
                </>
            ) : (
                <View style={styles.networkError}>
                    <Feather style={styles.networkIcon} name="wifi-off"/>
                    <Text style={styles.text}>No network connection. Please connect to a network.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    networkError: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%'
    },
    networkIcon: {
        color: theme.COLOR_PRIMARY,
        fontSize: 36,
        marginBottom: 12
    },
    text: {
        fontFamily: 'Roboto',
        color: theme.COLOR_PRIMARY,
        fontSize: 14,
        textAlign: 'center'
    }
})

const mapStateToProps = state => {
    return {
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    null
)(LoadingScreen)