import CustomTextInput from "./CustomTextInput";
import {View, StyleSheet, Text} from "react-native";
import PrimaryButton from "./PrimaryButton";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import AuthErrorMessage from "./AuthErrorMessage";
import template from "../styles/styles";

const UpdateProfileForm = ({profile, handleSubmit, toggleModal, auth, ui}) => {
    //Input refs used for focus on next input when Next is pressed
    let nameRef = {};
    let phoneRef = {};

    const changePasswordValidationSchema = Yup.object().shape({
        name: Yup.string()
            .label('Full Name')
            .required(),
        phone: Yup.string()
            .label('Phone Number')
            .required()
    });

    return (
        <Formik
            initialValues={{ name: profile.name, phone: profile.phone}}
            onSubmit={values => {
                handleSubmit(values.name, values.phone)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Full Name"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        returnKeyType="next"
                        input={input => nameRef = input}
                        onSubmitEditing={() => phoneRef.focus()}
                        focusHandler={() => {}}
                        blurOnSubmit={false}
                        blurHandler={() => setFieldTouched('name')}
                        error={touched.name && errors.name}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Phone Number"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        returnKeyType="go"
                        input={input => phoneRef = input}
                        onSubmitEditing={() => {
                            phoneRef.blur();
                            handleSubmit();
                        }}
                        focusHandler={() => {}}
                        blurOnSubmit={false}
                        keyboardType={'phone-pad'}
                        blurHandler={() => setFieldTouched('phone')}
                        error={touched.phone && errors.phone}
                    />
                    { !ui.isConnected ? (
                        <Text style={template.networkError}>No network connection detected.</Text>
                    ) : null }
                    { auth.updateProfileFailure ? <AuthErrorMessage errorCode={null} /> : null }
                    <View style={styles.modalActions}>
                        <PrimaryButton disabled={auth.updateProfileRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                        <PrimaryButton loading={auth.updateProfileRequest} disabled={auth.updateProfileRequest || !ui.isConnected} style={styles.button} title="Save" onPress={() => {handleSubmit()}} />
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
        account: state.account,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    null
)(UpdateProfileForm)