import React, { useState, useEffect } from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';

//Redux
import {bindActionCreators} from "redux";
import { updatePassword, updateProfile, updateEmail, logout, updateDegreeUnit } from "../actions/authActions";
import {connect} from "react-redux";

//local component imports
import CustomModal from "../components/CustomModal";
import UpdatePasswordForm from "../components/UpdatePasswordForm";
import UpdateEmailForm from "../components/UpdateEmailForm";
import UpdateProfileForm from "../components/UpdateProfileForm";

//third party component imports
import { Snackbar } from 'react-native-paper';
import IconToggle from "../components/IconToggle";
import {FontAwesome, Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import template from "../styles/styles";
import { TouchableRipple, Divider, Switch, Menu } from "react-native-paper";
import theme from "../styles/theme.styles";


const AccountScreen = ({navigation, updatePassword, updateProfile, updateEmail, logout, updateDegreeUnit, auth, ui}) => {
    const [updatePasswordModalVisible, setUpdatePasswordModalVisible] = useState(false);
    const [updateEmailModalVisible, setUpdateEmailModalVisible] = useState(false);
    const [updateProfileModalVisible, setUpdateProfileModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuOffset, setMenuOffset] = useState(0)
    const [name, setName] = useState(auth.user ? auth.user.name : null)
    const [email, setEmail] = useState(auth.user ? auth.user.name : null)
    const [degreeUnit, setDegreeUnit] = useState(auth.user ? auth.user.degreeUnit : null)
    const [snackText, setSnackText] = useState('');
    const [snackVisible, setSnackVisible] = useState(false);

    useEffect(() => {
        if(auth.user){
            setName(auth.user.name)
            setEmail(auth.user.email)
            setDegreeUnit(auth.user.degreeUnit)
        }
    }, [auth.user])

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    }

    const toggleDegreeUnit = (unit) => {
        if(unit !== degreeUnit)
            updateDegreeUnit(unit, auth.user.uid)
        toggleMenu();
    }

    //Modal contents
    const updatePasswordContent = () => {
        return(
            <UpdatePasswordForm handleSubmit={updatePasswordSubmit} toggleModal={togglePasswordModal} />
        )
    };

    const updateEmailContent = () => {
        return(
            <UpdateEmailForm handleSubmit={updateEmailSubmit} toggleModal={toggleEmailModal} />
        )
    };

    const updateProfileContent = () => {
        return(
            <UpdateProfileForm profile={auth.user} handleSubmit={updateProfileSubmit} toggleModal={toggleProfileModal} />
        )
    };

    //Toggle modals
    const togglePasswordModal = () => {
        setUpdatePasswordModalVisible(!updatePasswordModalVisible)
    };

    const toggleEmailModal = () => {
        setUpdateEmailModalVisible(!updateEmailModalVisible)
    };

    const toggleProfileModal = () => {
        setUpdateProfileModalVisible(!updateProfileModalVisible)
    };

    const toggleLogoutModal = () => {
        setLogoutModalVisible(!logoutModalVisible)
    };

    //Modal submits
    const updatePasswordSubmit = (currentPassword, newPassword) => {
        updatePassword(auth.user.email, currentPassword, newPassword, togglePasswordModal, toggleSnackBar);
    };

    const updateEmailSubmit = (newEmail, currentPassword) => {
        updateEmail(currentPassword, auth.user.email, newEmail, toggleEmailModal, toggleSnackBar);
    };

    const updateProfileSubmit = (name, phone) => {
        updateProfile({name, phone}, auth.user.uid, () => {
            toggleProfileModal();
        })
    };

    const toggleSnackBar = (text = snackText) => {
        setSnackText(text)
        setSnackVisible(!snackVisible)
    };

    const toggleNotifications = () => {
        setReceiveNotifications(!receiveNotifications)
    }

    return (
        <>
            <View style={styles.container}>
                <AccountHeader navigation={navigation} />
                <View style={{overflow: 'hidden', paddingBottom: 5, backgroundColor: theme.COLOR_BACKGROUND}}>
                    <View style={styles.accountInfo}>
                        <FontAwesome style={{color: theme.COLOR_TEXT, fontSize: 36, marginRight: 12}} name="user-circle"/>
                        {auth.user ? (
                            <View>
                                <Text style={{fontFamily: 'Montserrat-bold', fontSize: 18, color: theme.COLOR_TEXT}}>{name}</Text>
                                <Text style={{fontFamily: "Lato", color: theme.COLOR_TEXT}}>{email}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <ScrollView>
                    <View style={styles.content}>
                        <View style={{paddingHorizontal: 24, paddingVertical: 12}}>
                            <Text style={styles.settingsHeader}>Settings</Text>
                            <View style={template.card}>
                                <TouchableRipple onPress={toggleProfileModal}>
                                    <View style={styles.settingsItem}>
                                        <Text style={{fontFamily: 'Lato', fontSize: 16}}>Edit Profile</Text>
                                        <Feather style={{color: theme.COLOR_TEXT, fontSize: 20}} name="arrow-right"/>
                                    </View>
                                </TouchableRipple>
                                <Divider />
                                <TouchableRipple onPress={toggleEmailModal}>
                                    <View style={styles.settingsItem}>
                                        <Text style={{fontFamily: 'Lato', fontSize: 16}}>Change Email</Text>
                                        <Feather style={{color: theme.COLOR_TEXT, fontSize: 20}} name="arrow-right"/>
                                    </View>
                                </TouchableRipple>
                                <Divider />
                                <TouchableRipple onPress={togglePasswordModal}>
                                    <View style={styles.settingsItem}>
                                        <Text style={{fontFamily: 'Lato', fontSize: 16}}>Change Password</Text>
                                        <Feather style={{color: theme.COLOR_TEXT, fontSize: 20}} name="arrow-right"/>
                                    </View>
                                </TouchableRipple>
                                <Divider />
                                <Menu
                                    visible={menuVisible}
                                    onDismiss={toggleMenu}
                                    style={{marginLeft: menuOffset, width: 180}}
                                    anchor={
                                        <TouchableRipple disabled={auth.updateProfileRequest} onPress={toggleMenu}>
                                            <View style={[styles.settingsItem, auth.updateProfileRequest && styles.disabledItem]} onLayout={(event) => setMenuOffset(event.nativeEvent.layout.width - 180)}>
                                                <Text style={{fontFamily: 'Lato', fontSize: 16}}>Temperature Unit</Text>
                                                <MaterialCommunityIcons style={[{color: theme.COLOR_PRIMARY, fontSize: 24}, auth.updateProfileRequest && {color: theme.COLOR_TEXT}]} name={degreeUnit === "celsius" ? "temperature-celsius" : "temperature-fahrenheit"}/>
                                            </View>
                                        </TouchableRipple>
                                    }
                                >
                                    <Menu.Item onPress={() => toggleDegreeUnit('fahrenheit')} icon="temperature-fahrenheit" title="Fahrenheit" />
                                    <Menu.Item onPress={() => toggleDegreeUnit('celsius')} icon="temperature-celsius" title="Celsius" />
                                </Menu>
                                {/*<TouchableRipple onPress={toggleNotifications}>*/}
                                {/*    <View style={styles.settingsItem}>*/}
                                {/*        <Text style={{fontFamily: 'Lato', fontSize: 16}}>Receive Notifications</Text>*/}
                                {/*        <Switch*/}
                                {/*            value={receiveNotifications}*/}
                                {/*            onValueChange={toggleNotifications}*/}
                                {/*        />*/}
                                {/*    </View>*/}
                                {/*</TouchableRipple>*/}
                            </View>
                        </View>
                        <View style={{paddingHorizontal: 24, paddingVertical: 12}}>
                            <Text style={styles.settingsHeader}>Other</Text>
                            <View style={template.card}>
                                <TouchableRipple onPress={() => {}}>
                                    <View style={styles.settingsItem}>
                                        <Text style={{fontFamily: 'Lato', fontSize: 16}}>About FeverFilter</Text>
                                        <Feather style={{color: theme.COLOR_TEXT, fontSize: 20}} name="arrow-right"/>
                                    </View>
                                </TouchableRipple>
                                <Divider />
                                <TouchableRipple onPress={toggleLogoutModal}>
                                    <View style={styles.settingsItem}>
                                        <Text style={{fontFamily: 'Lato', fontSize: 16}}>Logout</Text>
                                        <Feather style={{color: theme.COLOR_TEXT, fontSize: 20}} name="log-out"/>
                                    </View>
                                </TouchableRipple>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <CustomModal
                    visible={updatePasswordModalVisible}
                    toggleModal={togglePasswordModal}
                    title="Update Password"
                    content={updatePasswordContent()}
                />
                <CustomModal
                    visible={updateProfileModalVisible}
                    toggleModal={toggleProfileModal}
                    title="Update Profile"
                    subTitle="To update your email, use Update Email in Settings."
                    content={updateProfileContent()}
                />
                <CustomModal
                    visible={updateEmailModalVisible}
                    toggleModal={toggleEmailModal}
                    title="Update Email"
                    subTitle="You must enter your current password to update your email."
                    content={updateEmailContent()}
                />
                <CustomModal
                    visible={logoutModalVisible}
                    toggleModal={toggleLogoutModal}
                    title="Logout of account?"
                    subTitle="This action will log you out of your account."
                    content={null}
                    confirmButton={{title: "Logout", action: () => {
                            toggleLogoutModal()
                            logout()
                        }}}
                />
            </View>
            <Snackbar
                visible={snackVisible}
                onDismiss={() => toggleSnackBar()}
                duration={3000}
                action={{
                    label: "Ok",
                    onPress: () => {
                        setSnackVisible(false)
                    },
                }}
            >
                {snackText}
            </Snackbar>
        </>
    )
};

const AccountHeader = ({navigation}) => {
    return(
        <View style={styles.accountHeader}>
            <IconToggle onPress={() => navigation.openDrawer()}>
                <FontAwesome style={styles.icon} name="navicon"/>
            </IconToggle>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 40}}>
                <Text style={[template.medHeader, {color: 'white', marginLeft: 12}]}>Account Settings</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    },
    content: {
        flex: 1,
        backgroundColor: theme.COLOR_BACKGROUND,
        paddingBottom: 30
    },
    accountHeader: {
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
    accountIcon: {
        fontSize: 18,
        color: theme.COLOR_TEXT
    },
    accountInfo: {
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2
    },
    settingsHeader: {
        fontFamily: 'Montserrat-bold',
        fontSize: 18,
        color: theme.COLOR_TEXT,
        padding: 12
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 18
    },
    disabledItem: {
        opacity: 0.6,
        backgroundColor: 'rgba(100,100,100,0.2)'
    }
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ updatePassword, updateProfile, updateEmail, logout, updateDegreeUnit }, dispatch)
};

const mapStateToProps = state => {
    return {
        auth: state.auth,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountScreen)