import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform} from 'react-native';
import theme from '../styles/theme.styles'
import {bindActionCreators} from "redux";
import {scanNetworks, getNetwork} from "../actions/wifiActions";
import {connect} from "react-redux";
import WifiIcon from "./WifiIcon";
import { FontAwesome} from "@expo/vector-icons";
import { TouchableRipple } from 'react-native-paper';
import CustomTextInput from "./CustomTextInput";
import PrimaryButton from "./PrimaryButton";
import template from "../styles/styles";

const WifiList = ({wifi, ble, deviceName, iosSsid, scanNetworks, toggleModal, handleSubmit, getNetwork}) => {
    const [networkList, setNetworkList] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(iosSsid || '');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    //Password input ref
    let passwordInput = {};

    //Start scanning wifi networks on mount
    useEffect(() => {
        if(Platform.OS === 'android')
            scanNetworks();
        else
            getNetwork();
    }, []);

    useEffect( () => {
        if(wifi.networkList.length && Platform.OS === 'android')
            filterWifiList()

    }, [wifi.networkList]);

    useEffect( () => {
        if(wifi.networkSsid)
            setSelectedNetwork(wifi.networkSsid)
    }, [wifi.networkSsid])

    //Close modal when connection is successful
    useEffect(() => {
        if(ble.status === 'CharacteristicReceived')
            toggleModal()
        if(ble.status === 'CharacteristicFailed')
            setErrorMessage('Could not connect. Check password.')
    }, [ble.status]);

    //Filter out unusably weak networks and sort by strength desc
    const filterWifiList = () => {
        let networkList = wifi.networkList.filter((network) => {
            return network.level > -80
        }).sort((network) => {
            return -network.level
        });
        setNetworkList(networkList);
        setSelectedNetwork('')
    };

    const selectNetwork = (SSID) => {
        //Set timeout allows the touch effect to animate prior to rerendering
        setTimeout(() => {
            if(networkList.length > 1){
                let network = networkList.find((network) => {
                    return network.SSID === SSID;
                });
                setNetworkList([network]);
                setSelectedNetwork(SSID)
            } else {
                filterWifiList();
            }
        })
    };

    const renderWifiList = () => {
        return networkList.map((network) => {
            return (
                <TouchableRipple key={network.BSSID} style={styles.wifiNetwork} onPress={() => selectNetwork(network.SSID)}>
                    <>
                        <View style={styles.row}>
                            <WifiIcon strength={network.level} locked={network.capabilities} size={40}/>
                            <Text style={styles.ssid}>{network.SSID}</Text>
                        </View>
                        {networkList.length > 1 ? <FontAwesome style={styles.icon} name="square-o"/> :
                            <FontAwesome style={styles.icon} name="check-square"/>}
                    </>
                </TouchableRipple>
            )
        })
    };

    const renderIosSsid = () => {
        return (
            <>
                <Text style={styles.title}>WiFi Network</Text>
                <View style={[styles.row, {paddingLeft: 12, paddingTop: 12}]}>
                    <WifiIcon strength={-50} locked={''} size={40}/>
                    <Text style={styles.network}>{selectedNetwork}</Text>
                </View>
            </>
        )
    }

    const renderPasswordInput = () => {
        return(
            <View>
                <Text style={styles.title}>Enter your WiFi password</Text>
                <CustomTextInput
                    style={template.textInput}
                    mode='outlined'
                    label="Wifi Password"
                    type="password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    returnKeyType = "go"
                    secureTextEntry={true}
                    input={input => passwordInput = input}
                    onSubmitEditing={() => {
                        passwordInput.blur()
                        handleSubmit({ssid: selectedNetwork, password})
                    }}
                    focusHandler={() => {}}
                    blurOnSubmit={true}
                    blurHandler={() => {}}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errorMessage}
                />
            </View>
        )
    }

    return(
        <>
            { ble.status !== 'SendingCharacteristic' && ble.status !== 'CharacteristicReceived' ? (
                <>
                    <Text style={styles.topTitle}>Send WiFi Credentials</Text>
                    <Text style={styles.subTitle}>{ Platform.OS === 'android' ?
                        "Select the WiFi network you want your FeverFilter device to connect to."
                        :
                        "Please ensure you are connected to the wifi network you want your FeverFilter device to connect to."
                    }</Text>
                    <ScrollView style={[styles.container, Platform.OS === 'android' && {maxHeight: 200}]}>
                        { networkList.length && Platform.OS === 'android' ? renderWifiList() : null }
                        { Platform.OS === 'ios' ? renderIosSsid() : null }
                        { selectedNetwork ? renderPasswordInput() : null }
                    </ScrollView>
                    <View style={styles.modalActions}>
                        <PrimaryButton mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                        <PrimaryButton loading={false} disabled={password.length < 8 || !selectedNetwork} style={styles.button} title="Confirm" onPress={() => handleSubmit({ssid: selectedNetwork, password})} />
                    </View>
                </>
            ) : (
                <View style={styles.connecting}>
                    <ActivityIndicator size="large" color={theme.COLOR_PRIMARY} />
                    <Text style={styles.connectingText}>Connecting {deviceName} to {selectedNetwork}...</Text>
                </View>
            )}
        </>

    )
};

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        borderColor: theme.COLOR_LIGHTGREY,
        marginTop: 12,
    },
    wifiNetwork: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 6,
        marginHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: theme.COLOR_LIGHTERGREY
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%'
    },
    ssid: {
        color: theme.COLOR_TEXT,
        fontSize: 14,
        fontFamily: 'Lato',
        marginLeft: 12
    },
    icon: {
        fontSize: 16,
        color: theme.COLOR_SECONDARY
    },
    title: {
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold',
        fontSize: 20,
        marginTop: 24
    },
    network: {
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Lato',
        fontSize: 18,
        padding: 12
    },
    topTitle: {
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold',
        fontSize: 20
    },
    subTitle: {
        color: theme.COLOR_LIGHTGREY,
        fontFamily: 'Lato',
        fontSize: 16
    },
    modalActions: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        flex: 1
    },
    cancelButton: {
        marginRight: 12
    },
    connecting: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 40
    },
    connectingText: {
        fontSize: 14,
        fontFamily: 'Lato-light',
        marginLeft: 12
    }
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ scanNetworks, getNetwork }, dispatch)
};

const mapStateToProps = state => {
    return {
        wifi: state.wifi,
        ble: state.ble
    }
};

export default React.memo(connect(
    mapStateToProps,
    mapDispatchToProps
)(WifiList))