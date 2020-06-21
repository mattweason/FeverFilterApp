import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet, Dimensions, ActivityIndicator, Image, Alert, StatusBar, Platform} from 'react-native';
import theme from '../styles/theme.styles'
import {BarCodeScanner} from 'expo-barcode-scanner';
import {FontAwesome} from "@expo/vector-icons";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {startScan, stopScan, clearConnectionError, scannedDeviceId} from "../actions/bleActions";
import PrimaryButton from "../components/PrimaryButton";
import CloseButton from "../components/CloseButton";

//Get window height and width
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

//Qr box style variables
const borderWidth = 2;

const QRCodeScannerScreen = ({ble, navigation, startScan, stopScan, clearConnectionError, scannedDeviceId}) => {
    const [scanned, setScanned] = useState(false);
    const [deviceBLEID, setDeviceBLEID] = useState('');
    const [connected, setConnected] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
        return () => {
            clearConnectionError();
            stopScan();
        }
    }, []);

    //We need oto ble id to auto connect during scanning
    useEffect(() => {
        if(deviceBLEID){
            startScan(deviceBLEID)
        }
    }, [deviceBLEID]);

    //Monitor ble connection status
    useEffect(() => {
        if(ble.status === "Discovering")
            setConnected(true);
        if(ble.status === "Listening")
            setTimeout(() => {
                navigation.goBack(null);
            }, 1000)
    }, [ble.status])

    //Alert any errors
    useEffect(() => {
        setHasError(true)
        if(ble.error) {
            Alert.alert(
                "Connection Error",
                ble.error,
                [
                    {text: "OK", onPress: () => {
                            clearConnectionError()
                            navigation.goBack(null)
                        }}
                ],
                {cancelable: false}
            );
        }
    }, [ble.error])

    const handleBarCodeScanned = ({data}) => {
        if(data.includes('ff')){
            setDeviceBLEID(data);
            scannedDeviceId(data);
            setScanned(true)
        }
    };

    return (
        <View style={styles.container} >
            <BarCodeScanner onBarCodeScanned = {scanned ? undefined : handleBarCodeScanned} style = {{height: windowHeight}}/>
            <View style={styles.banner}>
                <View style={{alignSelf: 'flex-end', marginRight: 12}}>
                    <CloseButton closeAction={() => navigation.goBack(null)} />
                </View>
                <Text style={styles.bannerText}>The QR code is located on your FeverFilter device.</Text>
            </View>
            <View style={styles.qrBox}>
                <View style={[styles.qrCorner, styles.topLeftBox]} />
                <View style={[styles.qrCorner, styles.topRightBox]} />
                <View style={[styles.qrCorner, styles.bottomLeftBox]} />
                <View style={[styles.qrCorner, styles.bottomRightBox]} />
                { scanned ? (
                    <View style={styles.deviceFound}>
                        <Image style={styles.logo} resizeMode="contain" source={require('../../assets/logo.png')} />
                    </View>
                ) : null }
            </View>
            <View style={styles.modal}>
                <View style={styles.card}>
                    <>
                        { hasError ? (
                                <>
                                    { connected ? (
                                        <>
                                            <FontAwesome style={styles.icon} name="check"/>
                                            <Text style={styles.cardText}>Successfully Connected!</Text>
                                        </>
                                    ) : (
                                        <>
                                            <ActivityIndicator size="small" color={theme.COLOR_PRIMARY} />
                                            { deviceBLEID ? <Text style={styles.cardText}>Connecting to FeverFilter</Text> : <Text style={styles.cardText}>Finding QR Code</Text>}
                                        </>
                                    ) }
                                </>
                            ) :
                            <PrimaryButton title="Scan Again" small onPress={() => {
                                setHasError(false);
                                setScanned(false);
                            }} />
                        }
                    </>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: windowHeight
    },
    loadingText: {
        fontSize: 24,
        fontFamily: 'Lato',
        color: theme.COLOR_PRIMARY,
        marginRight: 12
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    banner: {
        position: 'absolute',
        top: 0,
        height: '20%',
        width: '100%',
        backgroundColor: 'rgba(100,100,100,0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bannerText: {
        color: '#fff',
        fontFamily: 'Lato-light',
        fontSize: 14,
        width: '80%',
        textAlign: 'center',
        marginTop: 12
    },
    qrBox: {
        position: 'absolute',
        top: (windowHeight/2) - (windowWidth/4),
        left: windowWidth/4,
        width: windowWidth / 2,
        height: windowWidth / 2,
        flexDirection: 'row',
    },
    qrCorner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: '#fff',
    },
    topLeftBox: {
        top: 0,
        left: 0,
        borderLeftWidth: borderWidth,
        borderTopWidth: borderWidth
    },
    topRightBox: {
        top: 0,
        right: 0,
        borderRightWidth: borderWidth,
        borderTopWidth: borderWidth
    },
    bottomLeftBox: {
        bottom: 0,
        left: 0,
        borderLeftWidth: borderWidth,
        borderBottomWidth: borderWidth
    },
    bottomRightBox: {
        bottom: 0,
        right: 0,
        borderRightWidth: borderWidth,
        borderBottomWidth: borderWidth
    },
    modal: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        padding: 12
    },
    card: {
        padding: 12,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardText: {
        fontSize: 16,
        fontFamily: 'Lato-bold',
        color: theme.COLOR_PRIMARY,
        marginLeft: 12
    },
    deviceFound: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        width: '80%',
        height: '80%',
        padding: 20
    },
    icon: {
        color: theme.COLOR_GREEN,
        fontSize: 18
    }
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ startScan, stopScan, clearConnectionError, scannedDeviceId }, dispatch)
};

const mapStateToProps = state => {
    return {
        ble: state.ble
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(QRCodeScannerScreen)