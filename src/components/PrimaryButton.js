import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import theme from '../styles/theme.styles'

const PrimaryButton = ({ title, icon, onPress, small, mode, style, disabled, loading, altColor }) => {
    return(
        <Button
            labelStyle={small ? [styles.small] : [styles.label] }
            style={[styles.button, style, small && styles.smallButton]}
            contentStyle={small ? {height: 40} : {height: 50}}
            icon={icon}
            color={mode === 'outlined' ? '#fff' : altColor ? theme.COLOR_PRIMARY : theme.COLOR_SECONDARY}
            mode={mode}
            uppercase={false}
            disabled={disabled}
            loading={loading}
            onPress={onPress}>{title}</Button>
    )
};

const styles = StyleSheet.create({
    small: {
        marginVertical: 4,
        fontFamily: 'Lato'
    },
    label: {
        fontSize: 16,
        fontFamily: 'Lato',
    },
    button: {
        borderRadius: 3,
        justifyContent: 'center',
        height: 50
    },
    smallButton: {
        borderColor: '#fff',
        height: 40
    }
});

PrimaryButton.defaultProps = {
    small: false,
    icon: null,
    compact: false,
    mode: 'contained',
    disabled: false,
    loading: false
};

export default React.memo(PrimaryButton);