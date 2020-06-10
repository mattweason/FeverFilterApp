import React, { useState, useEffect } from 'react';
import {View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { signUp, signIn, resetPasswordEmail } from '../actions/authActions';
import { SafeAreaView } from 'react-native-safe-area-context';

//Component imports
import KeyboardShift from '../components/KeyboardShift';
import SignUpForm from "../components/SignUpForm";
import LoginForm from "../components/LoginForm";
import ResetPasswordForm from "../components/ResetPasswordForm";
import Fade from "../components/Fade";
import CustomModal from "../components/CustomModal";

//Css imports
import template from '../styles/styles';
import theme from '../styles/theme.styles';

//For fade animations
const duration = 100;

const AuthScreen = ({ navigation, signIn, signUp, resetPasswordEmail }) => {
    const [authType, setAuthType] = useState({
        type: 'login',
        toggleText: 'Sign Up',
        image: true,
        headerText: 'Log In',
        supportText: 'Enter your email and password below to log in'
    });
    const [resetModalVisible, setResetModalVisible] = useState(false)
    const [resetSuccessModalVisible, setResetSuccessModalVisible] = useState(false)
    const [visible, setVisible] = useState(true);

    //Toggle login vs signup content
    useEffect(() => {
        if(visible === false){
            setTimeout(() => {
                setAuthType(prevState => {
                    if(prevState.type === "signup"){
                        return {
                            type: 'login',
                            toggleText: 'Sign Up',
                            image: false,
                            headerText: 'Log In',
                            supportText: 'Enter your email and password below to log in'
                        }
                    } else {
                        return {
                            type: 'signup',
                            toggleText: 'Login',
                            image: true,
                            headerText: 'Sign Up',
                            supportText: 'Enter your information below to create an account'
                        }
                    }
                })
                toggleAuthType();
            }, duration);
        }
    }, [visible]);

    const toggleAuthType = () => {
        setVisible(prevState => !prevState)
    };

    const handleSignup = (email, password) => {
        signUp(email, password, navigation);
    }

    const handleLogin = (email, password) => {
        signIn(email, password, navigation)
    }

    const toggleSuccessModal = () => {
        setResetSuccessModalVisible(!resetSuccessModalVisible)
    }

    const toggleResetModal = () => {
        setResetModalVisible(!resetModalVisible)
    }

    const resetPasswordContent = () => {
        return(
            <ResetPasswordForm handleSubmit={resetPasswordSubmit} toggleModal={toggleResetModal} />
        )
    }

    const resetPasswordSubmit = (email) => {
        resetPasswordEmail(email, toggleResetModal, toggleSuccessModal);
    }

    return (
        <>
            <SafeAreaView style={{backgroundColor: theme.COLOR_PRIMARY, flex: 1}} forceInset={{top: 'always', bottom: 'never'}}>
                <KeyboardShift>
                    {(shiftUI) => (
                        <View style={{backgroundColor: '#fff', flex: 1, minHeight: Platform.OS === "android" ? Dimensions.get('window').height - StatusBar.currentHeight : Dimensions.get('window').height}}>
                            <AuthHeader />
                            <Fade style={[styles.container, authType.type === "signup" ? {marginTop: 90} : {marginTop: 40}]} duration={duration} visible={visible}>
                                <View>
                                    <View style={styles.titleText}>
                                        <Text style={template.largeHeader}>{authType.headerText}</Text>
                                    </View>
                                    <Text style={template.smallText}>{authType.supportText}</Text>
                                </View>
                                { authType.type === "signup" ?
                                    <SignUpForm style={styles.formContainer} shiftUI={shiftUI} onSubmit={handleSignup} /> :
                                    <LoginForm style={styles.formContainer} shiftUI={shiftUI} onSubmit={handleLogin} />
                                }
                                <TouchableOpacity activeOpacity={0.2} style={styles.authToggle} onPress={toggleAuthType}>
                                    <Text style={styles.loginButton}>{authType.toggleText}</Text>
                                </TouchableOpacity>
                                { authType.type === "login" ?
                                    <TouchableOpacity activeOpacity={0.2} style={styles.forgotPassword} onPress={toggleResetModal}>
                                        <Text style={styles.loginButton}>Forgot Password</Text>
                                    </TouchableOpacity> :
                                    null
                                }
                            </Fade>
                            <CustomModal
                                visible={resetModalVisible}
                                toggleModal={toggleResetModal}
                                title="Forgot your password?"
                                subTitle="Enter the email you used to sign up"
                                content={resetPasswordContent()}
                            />
                            <CustomModal
                                visible={resetSuccessModalVisible}
                                toggleModal={toggleSuccessModal}
                                title="Reset Password Email Sent"
                                subTitle="A password reset email has been sent to the provided email address"
                                content={null}
                                cancelButton={null}
                                confirmButton={{title: "OK", action: toggleSuccessModal}}
                            />
                        </View>
                    )}
                </KeyboardShift>
            </SafeAreaView>
        </>

    )
};

const AuthHeader = () => {
    return (
        <View style={styles.authHeader}>
            <Image style={styles.device} resizeMode="contain" source={require('../../assets/fever-filter-device.png')} />
            <Image style={styles.logo} resizeMode="contain" source={require('../../assets/logo.png')} />
        </View>
    )
}

AuthScreen.navigationOptions = () => {
    return {
        headerShown: false
    }
}

const styles = StyleSheet.create({
    titleText: {
        marginBottom: 12,
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    device: {
        top: "20%",
        width: '40%',
        height: 120
    },
    logo: {
        marginTop: 12,
        width: '40%',
        height: 80
    },
    container: {
        marginTop: 12,
        marginHorizontal: 36,
        justifyContent: 'center',
        flex: 1,
        paddingBottom: 48
    },
    loginButton: {
        fontFamily: 'Roboto',
        fontSize: 18,
        color: theme.COLOR_PRIMARY
    },
    authToggle: {
        position: 'absolute',
        bottom: 24,
        padding: 6,
        left: -6
    },
    forgotPassword: {
        position: 'absolute',
        bottom: 25,
        padding: 6,
        right: -6
    },
    formContainer: {
        marginBottom: 40,
    },
    authHeader: {
        height: 120,
        width: '100%',
        backgroundColor: theme.COLOR_PRIMARY,
        alignItems: 'center'
    }
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ signUp, signIn, resetPasswordEmail }, dispatch)
};

export default connect(
    null,
    mapDispatchToProps
)(AuthScreen)