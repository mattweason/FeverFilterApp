import { View, StyleSheet } from "react-native";
import PrimaryButton from "./PrimaryButton";
import CustomTextInput from "./CustomTextInput";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import template from "../styles/styles";

const ResetPasswordForm = ({handleSubmit, toggleModal, auth}) => {

    const changePasswordValidationSchema = Yup.object().shape({
        email: Yup.string()
            .label('Email')
            .required()
            .email()
    });

    return (
        <Formik
            initialValues={{ email: ''}}
            onSubmit={values => {
                handleSubmit(values.email)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        blurOnSubmit={true}
                        onSubmitEditing={() => handleSubmit()}
                        returnKeyType = {"go"}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('email')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.email && errors.email}
                    />
                    <View style={styles.modalActions}>
                        <PrimaryButton loading={auth.isSendingResetEmail} disabled={auth.isSendingResetEmail} style={styles.button} title="Reset Password" onPress={() => {handleSubmit()}} />
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
)(ResetPasswordForm)