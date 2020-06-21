import React from 'react';
import {Image, ScrollView, View, StyleSheet, Dimensions, Text, Platform, Linking, StatusBar } from 'react-native';
import { TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons, Feather, FontAwesome } from "@expo/vector-icons";
import theme from '../styles/theme.styles'
import {connect} from "react-redux";
import InAppBrowser from 'react-native-inappbrowser-reborn'
import IconToggle from './IconToggle'

const NavigationDrawer = ({auth, navigation, state}) => {

    const getActiveRouteName = () => {
        const route = state.routes[state?.index || 0];

        if (route.state) {
            return getActiveRouteName(route.state)
        }

        return route.name;
    }

    const drawerItems = [
        {
            title: "Your Devices",
            key: 'Home',
            icon: "safety-goggles",
            action: () => navigation.navigate('Home')
        },
        {
            title: "Account Settings",
            key: 'Account',
            icon: "user",
            action: () => navigation.navigate('Account')
        },
        {
            title: "Add New Device",
            key: null,
            icon: "plus",
            action: () => {
                navigation.navigate('NewDevice')
                navigation.closeDrawer()
            }
        },
        {
            title: "Visit Website",
            key: null,
            icon: "link-2",
            action: () => openWebsite('https://www.feverfilter.com/')
        },
        {
            title: "Report Issues",
            key: null,
            icon: "alert-triangle",
            action: () => {}
        },
    ];

    const openWebsite = async (url) => {
        navigation.closeDrawer()
        try {
            if (await InAppBrowser.isAvailable()) {
                const result = await InAppBrowser.open(url, {
                    // iOS Properties
                    dismissButtonStyle: 'cancel',
                    preferredBarTintColor: theme.COLOR_PRIMARY,
                    preferredControlTintColor: theme.COLOR_PRIMARY,
                    readerMode: false,
                    animated: false,
                    modalPresentationStyle: 'fullScreen',
                    modalTransitionStyle: 'partialCurl',
                    modalEnabled: true,
                    enableBarCollapsing: false,
                    // Android Properties
                    showTitle: true,
                    toolbarColor: theme.COLOR_PRIMARY,
                    secondaryToolbarColor: theme.COLOR_PRIMARY,
                    enableUrlBarHiding: true,
                    enableDefaultShare: true,
                    forceCloseOnRedirection: false,
                    // Specify full animation resource identifier(package:anim/name)
                    // or only resource name(in case of animation bundled with app).
                    animations: {
                        startEnter: 'slide_in_right',
                        startExit: 'slide_out_left',
                        endEnter: 'slide_in_left',
                        endExit: 'slide_out_right'
                    },
                    headers: {
                        'my-custom-header': 'my custom header value'
                    }
                })
            }
            else Linking.openURL(url)
        } catch (error) {
            console.log(error)
        }
    }

    const renderItems = () => {
        return drawerItems.map((item) => {
            return (
                <TouchableRipple onPress={() => setTimeout(() => {item.action()})} key={item.title}>
                    <View style={[styles.drawerItem, item.key === getActiveRouteName() && {backgroundColor: theme.COLOR_PRIMARY}]}>
                        <View style={styles.iconContainer}>
                            {item.icon === "safety-goggles" ? (
                                <MaterialCommunityIcons style={[styles.icon, item.key === getActiveRouteName() && {color: "#fff"}]} name={item.icon}/>
                            ) : (
                                <Feather style={[styles.icon, item.key === getActiveRouteName() && {color: "#fff"}]} name={item.icon}/>
                            )}
                        </View>
                        <Text style={[styles.itemText, item.key === getActiveRouteName() && {color: "#fff"}]}>{item.title}</Text>
                    </View>
                </TouchableRipple>
            )
        })
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.drawerHeader}>
                <FontAwesome style={{color: 'white', fontSize: 36, marginRight: 12}} name="user-circle"/>
                {auth.user ? (
                    <View>
                        <Text style={{fontFamily: 'Montserrat-bold', fontSize: 18, color: 'white'}}>{auth.user.name}</Text>
                        <Text style={{fontFamily: "Lato", color: 'white'}}>{auth.user.email}</Text>
                    </View>
                ) : null}
                <View style={styles.closeDrawer}>
                    <IconToggle onPress={() => navigation.closeDrawer()}>
                        <FontAwesome style={{color: '#fff', fontSize: 18}} name="arrow-left"/>
                    </IconToggle>
                </View>
            </View>
            <View style={styles.subHeader}>
                <Image style={{width: 160, height: 100}} resizeMode="contain" source={require('../../assets/logo.png')} />
            </View>
            { renderItems() }
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    drawerHeader: {
        width: '100%',
        height: 120,
        backgroundColor: theme.COLOR_PRIMARY,
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12
    },
    subHeader: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: theme.COLOR_LIGHTGREY,
    },
    closeDrawer: {
        position: 'absolute',
        right: 12,
        top: 30
    },
    image: {
        width: "100%",
        height: 100,
        flex: 1,
    },
    subheader: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderColor: theme.COLOR_LIGHTGREY,
        flexDirection: 'row',
        alignItems: 'center'
    },
    logo: {
        marginLeft: 6,
        width: 60,
        height: 40,
        marginRight: 12
    },
    name: {
        fontFamily: 'Montserrat',
        fontWeight: '100',
        fontSize: 18
    },
    drawerItem: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 18,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: theme.COLOR_LIGHTERGREY
    },
    activeItem: {
        backgroundColor: '#bbb',
        color: theme.COLOR_PRIMARY
    },
    activeText: {
        color: theme.COLOR_PRIMARY
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
        color: theme.COLOR_PRIMARY,
    },
    itemText: {
        fontSize: 14,
        fontFamily: 'Lato',
        color: theme.COLOR_PRIMARY
    }
});

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
};

export default React.memo(connect(
    mapStateToProps,
    null
)(NavigationDrawer));