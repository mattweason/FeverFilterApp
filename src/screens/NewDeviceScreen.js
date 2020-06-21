import React, { useRef, useEffect, useState } from 'react';
import {View, Image, StyleSheet, Dimensions, BackHandler, Platform, Alert, Text} from 'react-native';
import BackButton from "../components/BackButton";
import ConnectDevice from "../components/ConnectDevice";
import IconToggle from "../components/IconToggle";
import PrimaryButton from "../components/PrimaryButton"
import {FontAwesome} from "@expo/vector-icons";
import KeyboardShift from "../components/KeyboardShift";
import CustomModal from "../components/CustomModal";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import { disconnect } from "../actions/bleActions";
// import {addOto, addOtoReset} from "../actions/deviceActions";
import {newDeviceReady} from "../actions/uiActions";
import {sendWifiCharacteristic, clearConnectionError, scannedDeviceId} from "../actions/bleActions"
import { addDevice} from "../actions/deviceActions";
import {Snackbar} from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import WifiList from "../components/WifiList";
import * as Permissions from 'expo-permissions';
import template from "../styles/styles";
import theme from "../styles/theme.styles";

const NewDeviceScreen = ({navigation, ui, newDeviceReady, sendWifiCharacteristic, disconnect, ble, device, clearConnectionError, scannedDeviceId, addDevice}) => {
    const [active, setActive] = useState(1);
    const [deviceName, setDeviceName] = useState('');
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [wifiModalVisible, setWifiModalVisible] = useState(false)
    const [bleErrorSnack, setBleErrorSnack] = useState(false);
    const [bleErrorSnackText, setBleErrorSnackText] = useState("");
    const [addDeviceErrorSnack, setAddDeviceErrorSnack] = useState(false);
    const [connectInfoModal, setConnectInfoModal] = useState(false);
    const [iosSsid, setIosSsid] = useState('');
    const connectDevice = useRef();

    useEffect(() => {
        if(ble.status === "Listening" && active !== 2){

            //BLE may have disconnected after name was set
            if(deviceName.length)
                setActive(3);
            else
                setActive(2)
        }
        if(ble.status === "disconnected"){
            setActive(1);
        }
        if(ble.status === 'lost connection') {
            setActive(1);
            setBleErrorSnackText("Bluetooth lost connection.")
            setBleErrorSnack(true);
            if (wifiModalVisible)
                setWifiModalVisible(false)
        }
    }, [ble.status]);

    //Carousel ref data is not available until component is mounted
    useEffect(() => {
        newDeviceReady(false);

        const focusUnsubscribe = navigation.addListener('didFocus', payload => {
            BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        })

        const blurUnsubscribe = navigation.addListener('didBlur', payload => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        })

        return () => {
            scannedDeviceId('');
            focusUnsubscribe;
            blurUnsubscribe;
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
            clearConnectionError();
            disconnect();
            // addOtoReset()
        }

    }, []);

    useEffect(() => {
        if(ble.error){
            setBleErrorSnackText(ble.error)
            setBleErrorSnack(true);
        }
    }, [ble.error])

    const handleBackButton = () => {
        toggleCancelModal()
        return true;
    }

    const toggleConnectInfoModal = () => {
        setConnectInfoModal(!connectInfoModal);
    };

    const toggleWifiModal = () => {
        setWifiModalVisible(!wifiModalVisible);
    };

    //Only android can show list of wifi networks
    const handleSetUpWifi = () => {
        NetInfo.fetch().then(state => {
            if(Platform.OS === 'android'){
                if(state.isWifiEnabled) {
                    toggleWifiModal();
                } else if(!state.isWifiEnabled){
                    Alert.alert(
                        "No Wifi",
                        "Your phone's WiFi is not enabled. Please enable it and try again.",
                        [
                            {text: "OK", onPress: () => {}}
                        ],
                        {cancelable: false}
                    );
                }
            } else {
                if(state.type === 'wifi' || state.isConnected) {
                    setIosSsid(state.details.ssid);
                    toggleWifiModal(state.details);
                } else {
                    Alert.alert(
                        "Not Connected to WiFi",
                        "Please connect to the WiFi network you want your FeverFilter to connect to.",
                        [
                            {text: "OK", onPress: () => {}}
                        ],
                        {cancelable: false}
                    );
                }
            }
        });
    }

    const toggleCancelModal = () => {
        setCancelModalVisible(!cancelModalVisible);
    }

    return (
        <>
            <KeyboardShift>
                {(shiftUI) => (
                    <View style={styles.container}>
                        <NewDeviceHeader navigation={navigation} toggleCancelModal={toggleCancelModal} />
                        <View style={styles.scrollContainer}>
                            <ConnectDevice
                                ref={connectDevice}
                                connectModal={toggleConnectInfoModal}
                                clearConnectionError={clearConnectionError}
                                active={active}
                                setActive={setActive}
                                deviceName={deviceName}
                                setDeviceName={setDeviceName}
                                setUpWifi={handleSetUpWifi} />
                        </View>
                        <View style={styles.fabContainer}>
                            <PrimaryButton disabled={device.addDeviceRequest} mode="text" style={{flex: 1}} title={'Cancel'} onPress={toggleCancelModal} />
                            <PrimaryButton disabled={!ui.newDeviceReady || device.addDeviceRequest} style={{flex: 1, marginLeft: 12}} title={"Add Device"} loading={device.addDeviceRequest} onPress={() => {
                                addDevice(ble.scannedDeviceId, deviceName, navigation);
                            }} />
                        </View>
                        <CustomModal
                            visible={cancelModalVisible}
                            toggleModal={toggleCancelModal}
                            title="Are you sure you want to cancel?"
                            subTitle="Any data you have entered will be lost."
                            content={null}
                            confirmButton={{title: "OK", action: () => {
                                    toggleCancelModal();
                                    setTimeout(() => {
                                        navigation.goBack(null)
                                    }, 0)
                                }}}
                        />
                        <CustomModal
                            visible={wifiModalVisible}
                            toggleModal={toggleWifiModal}
                            content={<WifiList iosSsid={iosSsid} deviceName={deviceName} handleSubmit={(credentials) => {
                                sendWifiCharacteristic(credentials)
                            }} toggleModal={toggleWifiModal} />}
                        />
                        <CustomModal
                            visible={connectInfoModal}
                            toggleModal={toggleConnectInfoModal}
                            title="Automatically connect to FeverFilter"
                            subTitle="Let's connect to your FeverFilter. By scanning the QR code on your FeverFilter device we will automatically connect to it via Bluetooth."
                            content={null}
                            cancelButton={false}
                            confirmButton={{title: "Scan QR Code", action: async () => {
                                    clearConnectionError();
                                    //Check for permission before entering
                                    const {status} =
                                        Platform.OS === 'ios'
                                            ? await Permissions.askAsync(Permissions.CAMERA)
                                            : await Permissions.askAsync(Permissions.CAMERA, Permissions.LOCATION);

                                    if(status !== 'granted')
                                        Alert.alert(
                                            "Need Permission",
                                            Platform.OS === 'ios' ?
                                                "Camera permission is required to scan the QR Code and connect to your FeverFilter via bluetooth."
                                                : "Camera and Location permissions are required to scan the QR Code and connect to your FeverFilter via bluetooth.",
                                            [
                                                {text: "OK", onPress: () => toggleConnectInfoModal()}
                                            ],
                                            {cancelable: false}
                                        );
                                    else{
                                        toggleConnectInfoModal();
                                        setTimeout(() => {
                                            navigation.navigate('QRCodeScanner')
                                        })
                                    }
                                }}}
                        />
                        <Snackbar
                            visible={bleErrorSnack}
                            onDismiss={() => {
                                setBleErrorSnack(false)
                            }}
                            action={{
                                label: "Ok",
                                onPress: () => {
                                    setBleErrorSnack(false)
                                },
                            }}
                        >
                            {bleErrorSnackText}
                        </Snackbar>
                        <Snackbar
                            visible={addDeviceErrorSnack}
                            onDismiss={() => setAddDeviceErrorSnack(false)}
                            action={{
                                label: "Ok",
                                onPress: () => {
                                    setAddDeviceErrorSnack(false)
                                },
                            }}
                        >
                            Failed to add device. Please try again.
                        </Snackbar>
                    </View>
                )}
            </KeyboardShift>
        </>
    )
};

const NewDeviceHeader = ({navigation, toggleCancelModal}) => {
    return(
        <View style={styles.newDeviceHeader}>
            <IconToggle onPress={toggleCancelModal}>
                <FontAwesome style={styles.icon} name="arrow-left"/>
            </IconToggle>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[template.medHeader, {color: '#fff', marginLeft: 12}]}>Add New Device</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1
    },
    newDeviceHeader: {
        height: 120,
        width: "100%",
        backgroundColor: theme.COLOR_PRIMARY,
        paddingTop: 30,
        paddingHorizontal: 12,
        paddingBottom: 12,
        justifyContent: 'space-between',
    },
    scrollContainer: {
        marginTop: 12,
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1
    },
    fabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 36,
        marginBottom: 12,
        flex: 1
    },
    icon: {
        fontSize: 24,
        color: '#fff'
    },
    closeButton: {
        position: 'absolute',
        right: 12,
    }
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ newDeviceReady, sendWifiCharacteristic, disconnect, clearConnectionError, scannedDeviceId, addDevice }, dispatch)
};

const mapStateToProps = state => {
    return {
        ui: state.ui,
        ble: state.ble,
        device: state.device
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewDeviceScreen);