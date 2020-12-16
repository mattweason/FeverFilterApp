import React from 'react';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Text, View, StyleSheet} from "react-native";
import IconToggle from "./IconToggle";
import {FontAwesome} from "@expo/vector-icons";
import template from "../styles/styles";
import theme from "../styles/theme.styles";

const PageHeader = ({navigation, pageTitle}) => {
    const insets = useSafeAreaInsets()
    return(
        <View style={[styles.header, {paddingTop: insets.top, height: 120 + insets.top}]}>
            <IconToggle onPress={() => navigation.goBack(null)}>
                <FontAwesome style={styles.icon} name="arrow-left"/>
            </IconToggle>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                <Text style={[template.medHeader, {color: '#fff', marginLeft: 12}]}>{pageTitle}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        backgroundColor: theme.COLOR_PRIMARY,
        paddingTop: 30,
        paddingHorizontal: 12,
        paddingBottom: 12,
        justifyContent: 'flex-end',
    },
    icon: {
        fontSize: 24,
        color: '#fff'
    },
})

export default PageHeader;