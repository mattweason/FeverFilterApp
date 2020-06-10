import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../styles/theme.styles'

const CloseButton = ({closeAction}) => {

    return (
        <TouchableOpacity style={styles.closeButton} onPress={closeAction}>
            <FontAwesome style={styles.closeIcon}  name="times" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        padding: 3
    },
    closeIcon: {
        fontSize: 18,
        color: theme.COLOR_LIGHTGREY
    }
})

export default React.memo(CloseButton);