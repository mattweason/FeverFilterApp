import React, {forwardRef, useImperativeHandle, useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import theme from '../styles/theme.styles'
import PrimaryButton from "./PrimaryButton";
import CustomTextInput from "./CustomTextInput";
import {connect} from "react-redux";
import {startScan} from "../actions/bleActions"
import {FontAwesome} from "@expo/vector-icons";
import template from "../styles/styles";
import {bindActionCreators} from "redux";
import {newDeviceReady} from "../actions/uiActions";

//Gets correct height and width for logo
const window = Dimensions.get('window');

const ConnectDevice = forwardRef(({connectModal, ble, setUpWifi, setActive, active, ui, deviceName, setDeviceName, startScan}, ref) => {
    const [reconnect, setReconnect] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    //Input refs used for focus on next input when Next is pressed
    let deviceNameRef = {};

    useImperativeHandle(ref, () => ({
        setFocus() {
            deviceNameRef.focus();
        }
    }));

    useEffect(() => {
        if(ble.status === "lost connection"){
            setReconnecting(false);
            setReconnect(true);
        }
        if(ble.status === "Listening")
            setReconnect(false);
        if(ble.status === "Stopped scan"){
            setReconnecting(false);
            setReconnect(false);
        }
    }, [ble.status])

    return (
        <View style={styles.container}>
            { window.height >= 640 ? (
                <View style={[styles.row, {marginTop: 12}]}>
                    <Image style={styles.logo} resizeMode="contain" source={require('../../assets/logo.png')} />
                </View>
            ) : (
                <View style={{width: '100%', height: 20}} />
            )}
            <Header number="1" title="Connect to Device" active={active > 0} />
            <View style={styles.content}>
                { (active >= 2 && !reconnect) ? (
                    <View style={styles.successRow}>
                        <FontAwesome style={styles.icon} name="check"/>
                        <Text style={styles.successText}>Device Connected!</Text>
                    </View>
                ) : (reconnect) ? (
                    <PrimaryButton disabled={reconnecting} loading={reconnecting} icon="bluetooth" title="Reconnect" onPress={() => {
                        setReconnecting(true)
                        startScan(ble.scannedDeviceId)
                    }} />
                ) : (
                    <PrimaryButton icon="camera" title="Scan QR Code" onPress={() => connectModal()} />
                ) }

            </View>
            <Header number="2" title="Name Your FeverFilter" active={active > 1} />
            <View style={styles.content}>
                <CustomTextInput
                    style={template.textInput}
                    mode='outlined'
                    disabled={active <= 1}
                    label="FeverFilter Name"
                    input={input => deviceNameRef = input}
                    secureTextEntry={true}
                    value={deviceName}
                    returnKeyType = "next"
                    onEndEditing={() => {
                        if(deviceName.length){
                            setActive(3)
                        }
                    }}
                    onChangeText={text => setDeviceName(text)}
                    focusHandler={() => {}}
                    blurOnSubmit={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                />
            </View>
            <Header number="3" title="Set Up Device WiFi" active={active > 2} />
            <View style={[styles.content, styles.noBorder]}>

                { ble.status === "CharacteristicReceived" || ui.newDeviceReady ? (
                    <View style={styles.successRow}>
                        <FontAwesome style={styles.icon} name="check"/>
                        <Text style={styles.successText}>Your FeverFilter is online!</Text>
                    </View>
                ) : (
                    <PrimaryButton disabled={active < 3} icon="wifi" title="Set Up WiFi" onPress={() => setUpWifi()} />
                ) }
            </View>
        </View>
    )
});

const Header = ({number, title, active}) => {
    return (
        <View style={styles.header}>
            <View style={[styles.circle, active && styles.activeCircle]}>
                <Text style={styles.number}>{number}</Text>
            </View>
            <View style={[styles.inactive, active && styles.active]}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 36,
    },
    logo: {
        width: 120,
        height: 80,
        marginTop: -24
    },
    row: {
        alignItems: 'center',
        width: '100%'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    circle: {
        backgroundColor: '#707070',
        height: 30,
        width: 30,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 2,
        marginRight: 12
    },
    activeCircle: {
        backgroundColor: theme.COLOR_PRIMARY
    },
    number: {
        fontSize: 20,
        fontFamily: 'Lato',
        color: '#fff'
    },
    title: {
        fontSize: 20,
        fontFamily: 'Montserrat-light',
        color: theme.COLOR_PRIMARY
    },
    active: {
        opacity: 1
    },
    inactive: {
        opacity: 0.4
    },
    content: {
        flex: 1,
        height: 60,
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderLeftWidth: 1,
        borderColor: theme.COLOR_LIGHTERGREY,
        marginHorizontal: 15,
        marginVertical: 12,
        paddingLeft: 24
    },
    noBorder: {
        borderColor: '#fff'
    },
    icon: {
        color: theme.COLOR_GREEN,
        fontSize: 24
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    successText: {
        marginLeft: 12,
        fontFamily: 'Lato-light',
        fontSize: 16,
        color: theme.COLOR_PRIMARY
    }
});

const mapStateToProps = state => {
    return {
        ble: state.ble,
        ui: state.ui
    }
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ startScan }, dispatch)
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {forwardRef: true}
)(ConnectDevice)