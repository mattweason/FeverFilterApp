import CustomTextInput from "./CustomTextInput";
import {View, StyleSheet, Text} from "react-native";
import PrimaryButton from "./PrimaryButton";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import template from "../styles/styles";

const ManualConnectForm = ({handleSubmit, toggleModal, ble, ui}) => {
    //Input refs used for focus on next input when Next is pressed
    let serialRef = {};
    const bleStatusArray = ["Scanning", "Connecting", "Discovering", "Setting Notifications", "Listening"]

    const changePasswordValidationSchema = Yup.object().shape({
        serial: Yup.string()
            .label('Serial Number')
            .required(),
    });

    return (
        <>
            <Text>In order to connect manually, enter the serial number found on the back of your FeverFilter and press Connect.</Text>
            <Formik
                initialValues={{ serial: ""}}
                onSubmit={values => {
                    handleSubmit(values.serial)
                }}
                validationSchema={changePasswordValidationSchema}
            >
                {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                    <>
                        <CustomTextInput
                            style={template.textInput}
                            mode='outlined'
                            label="Serial Number"
                            value={values.serial}
                            onChangeText={handleChange('serial')}
                            returnKeyType="next"
                            input={input => serialRef = input}
                            autoCapitalize='characters'
                            onSubmitEditing={() => {
                                serialRef.blur();
                                handleSubmit();
                            }}
                            focusHandler={() => {}}
                            blurOnSubmit={false}
                            blurHandler={() => setFieldTouched('serial')}
                            error={touched.serial && errors.serial}
                        />
                        { !ui.isConnected ? (
                            <Text style={template.networkError}>No network connection detected.</Text>
                        ) : null }
                        <View style={styles.modalActions}>
                            <PrimaryButton loading={bleStatusArray.indexOf(ble.status) >= 0} disabled={bleStatusArray.indexOf(ble.status) >= 0 || !ui.isConnected} style={styles.button} title="Connect" onPress={() => {
                                serialRef.blur();
                                handleSubmit()
                            }} />
                        </View>
                    </>
                )}
            </Formik>
        </>
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
        ble: state.ble,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    null
)(ManualConnectForm)