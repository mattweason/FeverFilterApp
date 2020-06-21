import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../styles/theme.styles'

const BackButton = ({title, onPress, disabled}) => {
    return(
        <View style={[styles.container, disabled && styles.disabled]}>
            <TouchableOpacity disabled={disabled} style={styles.buttonRow} onPress={() => onPress()}>
                <MaterialCommunityIcons style={styles.icon} name="arrow-left"/>
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginLeft: -12
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        fontSize: 18,
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Lato-bold',
        marginRight: 12
    },
    icon: {
        fontSize: 24,
        marginTop: 4,
        marginRight: 4,
        color: theme.COLOR_PRIMARY
    },
    disabled: {
        opacity: 0.2
    }
});

export default React.memo(BackButton);