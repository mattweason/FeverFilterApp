import CustomTextInput from "./CustomTextInput";
import {View, StyleSheet, Text} from "react-native";
import PrimaryButton from "./PrimaryButton";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import AuthErrorMessage from "./AuthErrorMessage";
import template from "../styles/styles";

const UpdatePasswordForm = ({handleSubmit, toggleModal, auth, ui}) => {
    //Input refs used for focus on next input when Next is pressed
    let currentPasswordRef = {};
    let newPasswordRef = {};

    const changePasswordValidationSchema = Yup.object().shape({
        currentPassword: Yup.string()
            .label('Current Password')
            .required(),
        newPassword: Yup.string()
            .label('New Password')
            .required()
            .min(6, 'Password must have at least 6 characters')
    });

    return (
        <Formik
            initialValues={{ currentPassword: '', newPassword: ''}}
            onSubmit={values => {
                handleSubmit(values.currentPassword, values.newPassword)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Current Password"
                        type="password"
                        secureTextEntry={true}
                        value={values.currentPassword}
                        returnKeyType = {"next"}
                        input={input => currentPasswordRef = input}
                        onSubmitEditing={() => newPasswordRef.focus()}
                        onChangeText={handleChange('currentPassword')}
                        blurOnSubmit={false}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('currentPassword')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.currentPassword && errors.currentPassword}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="New Password"
                        type="password"
                        secureTextEntry={true}
                        value={values.newPassword}
                        returnKeyType = "go"
                        input={input => newPasswordRef = input}
                        onSubmitEditing={() => {
                            newPasswordRef.blur();
                            handleSubmit();
                        }}
                        onChangeText={handleChange('newPassword')}
                        blurOnSubmit={false}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('newPassword')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.newPassword && errors.newPassword}
                    />
                    { !ui.isConnected ? (
                        <Text style={template.networkError}>No network connection detected.</Text>
                    ) : null }
                    { auth.updatePasswordFailure ? <AuthErrorMessage errorCode={auth.updatePasswordErrorMessage === "auth/wrong-password" ? "incorrect-password" : auth.updatePasswordErrorMessage}/> : null }
                    <View style={styles.modalActions}>
                        <PrimaryButton disabled={auth.updatePasswordRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                        <PrimaryButton loading={auth.updatePasswordRequest} disabled={auth.updatePasswordRequest || !ui.isConnected} style={styles.button} title="Save" onPress={() => {handleSubmit()}} />
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
        auth: state.auth,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    null
)(UpdatePasswordForm)