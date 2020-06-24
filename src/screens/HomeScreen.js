import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import {Divider, Menu} from 'react-native-paper';
import {connect} from "react-redux";
import PrimaryButton from "../components/PrimaryButton";
import IconToggle from "../components/IconToggle";
import WifiIcon from "../components/WifiIcon";
import theme from '../styles/theme.styles'
import template from '../styles/styles'
import {FontAwesome, MaterialCommunityIcons} from '@expo/vector-icons'
import {fetchDevices, renameDevice} from "../actions/deviceActions";
import {bindActionCreators} from "redux";
import CustomModal from "../components/CustomModal";
import TemperatureThreshold from "../components/TempertureThreshold";
import RenameDeviceForm from "../components/RenameDeviceForm";

//Convert temperature to fahrenheit
const convertToF = (degree) => {
    return Math.round((degree * (9/5) + 32) * 10) / 10
}

const roundToDec = (input) => {
    return Math.round(input*10) / 10
}

const HomeScreen = ({navigation, fetchDevices, renameDevice, device, auth}) => {
    const [menuVisible, setMenuVisible] = useState(-1)
    const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [threshold, setThreshold] = useState(0);

    useEffect(() => {
        fetchDevices();
    }, []);

    const toggleMenu = (index) => {
        if(index >= 0){
            setDeviceName(device.devices[index].deviceName)
            setDeviceId(device.devices[index].deviceId)
            setThreshold(device.devices[index].tempThresh)
            setMenuVisible(index);
        }
        else
            setMenuVisible(-1)
    }

    const toggleThresholdModalVisible = () => {
        setThresholdModalVisible(!thresholdModalVisible)
    }

    const toggleRenameModalVisible = () => {
        setRenameModalVisible(!renameModalVisible)
    }

    const thresholdModalContent = () => {
        return <TemperatureThreshold deviceId={deviceId} initialThreshold={threshold} toggleModal={toggleThresholdModalVisible} />
    }

    const renameModalContent = () => {
        return (
            <RenameDeviceForm handleSubmit={renameModalSubmit} deviceName={deviceName} toggleModal={toggleRenameModalVisible} />
        )
    }

    const renameModalSubmit = (deviceName) => {
        renameDevice(deviceId, deviceName, toggleRenameModalVisible);
    }

    const renderDevices = () => {
        return device.devices.map((device, index) => {
            return (
                <View style={{marginTop: 24}} key={device.deviceId}>
                    <Text style={styles.deviceName}>{device.deviceName}</Text>
                    <View style={[template.card, styles.deviceCard]}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{justifyContent: 'space-between', marginRight: 36}}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.temperature}>{ auth.user.degreeUnit === "celsius" ? roundToDec(device.tempThresh).toFixed(1) : convertToF(device.tempThresh).toFixed(1)}</Text>
                                    <Text style={styles.degree}>{'\u00b0'}{ auth.user.degreeUnit === "celsius" ? "C" : "F"}</Text>
                                </View>
                                <Text style={styles.statusText}>Threshold</Text>
                            </View>
                            <WifiStatus strength={device.wifiState} />
                        </View>
                        <Menu
                            visible={menuVisible === index}
                            onDismiss={toggleMenu}
                            anchor={
                                <IconToggle onPress={() => toggleMenu(index)}>
                                    <FontAwesome style={{fontSize: 32, color: theme.COLOR_TEXT}} name="cog"/>
                                </IconToggle>
                            }
                        >
                            <Menu.Item onPress={() => {}} disabled={true} icon="settings" title="Settings" />
                            <Divider />
                            <Menu.Item onPress={() => {}} icon="wifi" title="Network Settings" />
                            <Menu.Item onPress={() => {
                                toggleMenu(-1)
                                toggleThresholdModalVisible()
                            }} icon="thermometer" title="Change Threshold" />
                            <Menu.Item onPress={() => {
                                toggleMenu(-1)
                                toggleRenameModalVisible()
                            }} icon="square-edit-outline" title="Rename Device" />
                        </Menu>
                    </View>
                </View>
            )
        })
    }

    return(
        <View style={styles.container}>
            <HomeHeader navigation={navigation} />
            <ScrollView contentContainerStyle={styles.container}>
                { device.fetchDevicesRequest ? (
                    <View style={styles.centerContent}>
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color={theme.COLOR_PRIMARY} />
                            <Text style={styles.loadingText}>Loading</Text>
                        </View>
                    </View>
                ) : device.devices && auth.user ? (
                    <View style={styles.mainContent}>
                        { renderDevices() }
                    </View>
                ) : (
                    <View style={styles.centerContent}>
                        <Text style={[template.smallText, {width: '80%', marginBottom: 24, textAlign: 'center'}]}>
                            You currently have no FeverFilter devices
                            set up. Click Add New FeverFilter below
                            to get started!
                        </Text>
                        <PrimaryButton icon="plus" title="Add New FeverFilter" onPress={() => navigation.navigate('NewDevice')} />
                    </View>
                )}
            </ScrollView>
            <CustomModal
                visible={thresholdModalVisible}
                toggleModal={toggleThresholdModalVisible}
                title="Change Threshold"
                subTitle="Change the temperature threshold at which a reading will be flagged as a possible fever."
                content={thresholdModalContent()}
            />
            <CustomModal
                visible={renameModalVisible}
                toggleModal={toggleRenameModalVisible}
                title="Rename Device"
                content={renameModalContent()}
            />
        </View>
    )
};

const HomeHeader = ({navigation}) => {
    return(
        <View style={styles.homeHeader}>
            <IconToggle onPress={() => navigation.openDrawer()}>
                <FontAwesome style={styles.icon} name="navicon"/>
            </IconToggle>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[template.medHeader, {color: '#fff', marginLeft: 12}]}>Your Devices</Text>
                <PrimaryButton small icon="plus" mode="outlined" title="Add" onPress={() => navigation.navigate('NewDevice')}/>
            </View>
        </View>
    )
}

const WifiStatus = ({strength}) => {
    let strengthText;

    if(!strength)
        strengthText = "N/A";
    else if(strength < -70)
        strengthText = "Weak";
    else if(strength >= -70 && strength < -60)
        strengthText = "Average";
    else if(strength >= -60 && strength < -50)
        strengthText = "Good";
    else if(strength >= -50)
        strengthText = "Strong";

    return (
        <View style={{justifyContent: 'space-between', alignItems: 'center'}}>
            <WifiIcon strength={strength} size={40} />
            <Text style={styles.statusText}>{strengthText}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    homeHeader: {
        height: 120,
        width: "100%",
        backgroundColor: theme.COLOR_PRIMARY,
        paddingTop: 30,
        paddingHorizontal: 12,
        paddingBottom: 12,
        justifyContent: 'space-between',
    },
    icon: {
        fontSize: 18,
        color: '#fff'
    },
    centerContent: {
        flex: 1,
        backgroundColor: theme.COLOR_BACKGROUND,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainContent: {
        paddingHorizontal: 24
    },
    loading: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    loadingText: {
        fontFamily: 'Lato',
        fontSize: 24,
        marginLeft: 12
    },
    deviceCard: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    deviceName: {
        fontFamily: 'Montserrat-bold',
        fontSize: 18,
        marginBottom: 12,
        marginLeft: 12,
        color: theme.COLOR_TEXT
    },
    statusText: {
        fontFamily: 'Lato',
        fontSize: 14,
        color: theme.COLOR_LIGHTERGREY
    },
    temperature: {
        fontFamily: 'Lato-bold',
        color: theme.COLOR_TEXT,
        fontSize: 32
    },
    degree: {
        fontFamily: 'Lato-bold',
        fontSize: 14,
        color: theme.COLOR_TEXT
    }
});

const mapStateToProps = state => {
    return {
        ui: state.ui,
        auth: state.auth,
        device: state.device
    }
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchDevices, renameDevice }, dispatch)
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeScreen)