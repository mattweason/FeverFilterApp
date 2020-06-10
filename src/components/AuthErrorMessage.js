import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AuthErrorMessage = ({errorCode}) => {
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if(errorCode){
            if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found')
                setErrorMessage('Email or password is invalid.')
            else if (errorCode === 'auth/too-many-requests')
                setErrorMessage('Too many attempts. Try again later.')
            else if (errorCode === 'auth/email-already-in-use')
                setErrorMessage('An account already exists for this email address.')
            else if (errorCode === 'auth/network-request-failed')
                setErrorMessage('Cannot connect to server.')
            else
                setErrorMessage('Unknown error.')
        }
    })

    return(
        <View>
            <Text style={styles.error}>{errorMessage}</Text>
        </View>
    )
};

const styles = StyleSheet.create({

    error: {
        fontSize: 14,
        color: 'red',
        bottom: -4,
        left: 6
    }
})

export default AuthErrorMessage;