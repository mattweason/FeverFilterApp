import { StyleSheet } from 'react-native';
import theme from './theme.styles';

//Global CSS styling
export default StyleSheet.create({
    largeHeader: {
        fontSize: 30,
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold'
    },
    medHeader: {
        fontSize: 24,
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold'
    },
    header: {
        fontSize: 18,
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold'
    },
    smallText: {
        fontSize: 16,
        color: theme.COLOR_LIGHTGREY,
        fontFamily: 'Lato'
    },
    textInput: {
        backgroundColor: '#fff'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2
    },
    networkError: {
        color: theme.COLOR_SECONDARY,
        textAlign: 'center',
        marginTop: 6
    }
})