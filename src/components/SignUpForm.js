import React from 'react';
import {View} from 'react-native';
import CustomTextInput from "./CustomTextInput";
import { Formik } from 'formik';
import * as Yup from 'yup';
import template from '../styles/styles';
import PrimaryButton from "./PrimaryButton";
import AuthErrorMessage from "./AuthErrorMessage";

import {connect} from "react-redux";

const SignUpForm = ({shiftUI, onSubmit, style, auth}) => {

    //Input refs used for focus on next input when Next is pressed
    let nameRef = {};
    let phoneRef = {};
    let emailRef = {};
    let passwordInput = {};

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .label('Full Name')
            .required(),
        phone: Yup.string()
            .label('Phone Number')
            .required(),
        email: Yup.string()
            .label('Email')
            .email('Enter a valid email.')
            .required(),
        password: Yup.string()
            .label('Password')
            .required()
            .min(6, 'Password must have at least 6 characters')
    });

    return (
        <Formik
            initialValues={{ name: '', phone: '', email: '', password: ''}}
            onSubmit={values => onSubmit(values.email, values.password, values.phone, values.name)}
            validationSchema={validationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <View style={style}>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Full Name"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        returnKeyType = {"next"}
                        input={input => nameRef = input}
                        onSubmitEditing={() => phoneRef.focus()}
                        onFocus={() => shiftUI(null)}
                        blurOnSubmit={false}
                        onBlur={() => setFieldTouched('name')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.name && errors.name}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        type="phone"
                        label="Phone Number"
                        keyboardType="phone-pad"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        returnKeyType = {"next"}
                        input={input => phoneRef = input}
                        onSubmitEditing={() => {emailRef.focus()}}
                        focusHandler={() => shiftUI(null)}
                        blurOnSubmit={false}
                        onBlur={() => setFieldTouched('phone')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.phone && errors.phone}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Email"
                        keyboardType="email-address"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        returnKeyType = {"next"}
                        input={input => emailRef = input}
                        onSubmitEditing={() => passwordInput.focus()}
                        focusHandler={() => shiftUI(null)}
                        blurOnSubmit={false}
                        onBlur={() => setFieldTouched('email')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.email && errors.email}
                    />
                    <CustomTextInput
                        mode='outlined'
                        label="Password"
                        type="password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        returnKeyType = "go"
                        secureTextEntry={true}
                        input={input => passwordInput = input}
                        onSubmitEditing={() => {
                            passwordInput.blur();
                            handleSubmit();
                        }}
                        focusHandler={() => shiftUI(null)}
                        blurOnSubmit={false}
                        blurHandler={() => setFieldTouched('password')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.password && errors.password}
                    />
                    { auth.loginError ? <AuthErrorMessage errorCode={auth.loginErrorMessage}/> : null }
                    <PrimaryButton disabled={auth.isLoggingIn} loading={auth.isLoggingIn} style={{marginTop: 12}} title="Create Account" onPress={handleSubmit} />
                </View>
            )}
        </Formik>
    )
}

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
};

export default connect(
    mapStateToProps,
    null
)(SignUpForm)