import CustomTextInput from "./CustomTextInput";
import { View, StyleSheet } from "react-native";
import PrimaryButton from "./PrimaryButton";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import AuthErrorMessage from "./AuthErrorMessage";
import template from "../styles/styles";

const UpdateEmailForm = ({handleSubmit, toggleModal, auth}) => {
    //Input refs used for focus on next input when Next is pressed
    let emailRef = {};
    let passwordRef = {};

    const changePasswordValidationSchema = Yup.object().shape({
        email: Yup.string()
            .label('New Email')
            .email('Enter a valid email.')
            .required(),
        password: Yup.string()
            .label('Password')
            .required()
    });

    return (
        <Formik
            initialValues={{ email: '', password: ''}}
            onSubmit={values => {
                handleSubmit(values.email, values.password)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="New Email"
                        keyboardType="email-address"
                        secureTextEntry={true}
                        value={values.email}
                        returnKeyType = {"next"}
                        input={input => emailRef = input}
                        onSubmitEditing={() => passwordRef.focus()}
                        onChangeText={handleChange('email')}
                        blurOnSubmit={false}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('email')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.email && errors.email}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Password"
                        type="password"
                        secureTextEntry={true}
                        value={values.password}
                        returnKeyType = "go"
                        input={input => passwordRef = input}
                        onSubmitEditing={() => {
                            passwordRef.blur();
                            handleSubmit();
                        }}
                        onChangeText={handleChange('password')}
                        blurOnSubmit={false}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('password')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.password && errors.password}
                    />
                    { auth.updateEmailFailure ? <AuthErrorMessage errorCode={auth.updatePasswordErrorMessage === "auth/wrong-password" ? "incorrect-password" : auth.updatePasswordErrorMessage}/> : null }
                    <View style={styles.modalActions}>
                        <PrimaryButton disabled={auth.updateEmailRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                        <PrimaryButton loading={auth.updateEmailRequest} disabled={auth.updateEmailRequest} style={styles.button} title="Save" onPress={() => {handleSubmit()}} />
                    </View>
                </>
            )}
        </Formik>
    )
};

const styles = StyleSheet.create({
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
    }
})

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
};

export default connect(
    mapStateToProps,
    null
)(UpdateEmailForm)