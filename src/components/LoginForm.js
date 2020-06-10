import React from 'react';
import * as Yup from "yup";
import {Formik} from "formik";
import {connect} from "react-redux";
import CustomTextInput from "./CustomTextInput";
import template from '../styles/styles'
import theme from '../styles/theme.styles'
import PrimaryButton from "./PrimaryButton";
import AuthErrorMessage from "./AuthErrorMessage";

const LoginForm = ({shiftUI, onSubmit, style, auth}) => {

    //Input refs used for focus on next input when Next is pressed
    let emailRef = {};
    let passwordInput = {};

    const validationSchema = Yup.object().shape({
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
            style={style}
            initialValues={{ email: '', password: ''}}
            onSubmit={values => onSubmit(values.email, values.password)}
            validationSchema={validationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        selectionColor={theme.COLOR_PRIMARY}
                        underlineColor={theme.COLOR_PRIMARY}
                        mode='outlined'
                        label="Email"
                        keyboardType="email-address"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        returnKeyType = {"next"}
                        input={input => emailRef = input}
                        onSubmitEditing={() => passwordInput.focus()}
                        onFocus={() => shiftUI(null)}
                        blurOnSubmit={false}
                        onBlur={() => setFieldTouched('email')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={touched.email && errors.email}
                    />
                    <CustomTextInput
                        style={template.textInput}
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
                    <PrimaryButton disabled={auth.isLoggingIn} loading={auth.isLoggingIn} style={{marginTop: 12}} title="Submit" onPress={handleSubmit} />
                </>
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
)(LoginForm)