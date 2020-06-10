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
        fontSize: 20,
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat'
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
        backgroundColor: '#fff',
        height: 50
    }
})