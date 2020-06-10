import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {bindActionCreators} from "redux";
import {logout} from "../actions/authActions";
import {connect} from "react-redux";
import PrimaryButton from "../components/PrimaryButton";

const HomeScreen = ({logout}) => {
    return(
        <View style={styles.container}>
            <Text>Home screen</Text>
            <PrimaryButton title="logout" onPress={logout} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});



const mapDispatchToProps = dispatch => {
    return bindActionCreators({ logout }, dispatch)
};

export default connect(
    null,
    mapDispatchToProps
)(HomeScreen)