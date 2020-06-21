import React, {useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import template from "../styles/styles";
import theme from '../styles/theme.styles'
import {Ionicons} from "@expo/vector-icons";
import TextInputMask from 'react-native-text-input-mask';

const CustomTextInput = ({ type, error, disabled, input, ...props }) => {
    const [hidePassword, setHidePassword] = useState(type === 'password');

    const showPassword = () => {
        setHidePassword(!hidePassword)
    };

    const renderShowHideIcon = () => {
        if (type === "password") {
            return <Ionicons style={styles.icon} name={hidePassword ? "md-eye-off" : "md-eye"} onPress={showPassword} />
        }
    };

    return(
        <View style={[styles.container, disabled && {opacity: 0.4}]}>
            { type === 'phone' ? (
                <TextInput
                    {...props}
                    style={template.textInput}
                    secureTextEntry={hidePassword}
                    editable={!disabled}
                    error={error}
                    theme={{ colors: { primary: theme.COLOR_PRIMARY, error: theme.COLOR_SECONDARY}}}
                    render={props =>
                        <TextInputMask
                            {...props}
                            refInput={input}
                            mask="+1 ([000]) [000]-[0000]"
                        />
                    }
                />
            ) : (
                <TextInput
                    {...props}
                    style={template.textInput}
                    secureTextEntry={hidePassword}
                    editable={!disabled}
                    ref={input}
                    error={error}
                    theme={{ colors: { primary: theme.COLOR_PRIMARY, error: theme.COLOR_SECONDARY}}}
                />
            )}
            { error ? <Text style={styles.error}>{error}</Text> : null }
            { renderShowHideIcon() }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        paddingBottom: 16,
        width: '100%',
    },
    disabled: {
        opacity: 0.6
    },
    icon: {
        zIndex: 9999,
        fontSize: 24,
        color: '#aaa',
        position: 'absolute',
        right: 10,
        bottom: 23,
        padding: 6,
    },
    error: {
        fontSize: 14,
        fontFamily: 'Lato',
        color: theme.COLOR_SECONDARY,
        position: 'absolute',
        bottom: -4,
        left: 10
    },
})

export default CustomTextInput;