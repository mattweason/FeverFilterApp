import { View, StyleSheet } from "react-native";
import PrimaryButton from "./PrimaryButton";
import CustomTextInput from "./CustomTextInput";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import template from "../styles/styles";

const RenameDeviceForm = ({handleSubmit, deviceName, toggleModal, device}) => {

    const changePasswordValidationSchema = Yup.object().shape({
        deviceName: Yup.string()
            .label('FeverFilter Name')
            .required()
    });

    return (
        <Formik
            initialValues={{ deviceName }}
            onSubmit={values => {
                handleSubmit(values.deviceName)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="FeverFilter Name"
                        value={values.deviceName}
                        onChangeText={handleChange('deviceName')}
                        blurOnSubmit={true}
                        onSubmitEditing={() => handleSubmit()}
                        returnKeyType = {"go"}
                        focusHandler={() => {}}
                        blurHandler={() => setFieldTouched('deviceName')}
                        autoCapitalize="none"
                        autoCorrect={false}
                        required
                        error={touched.deviceName && errors.deviceName}
                    />
                    <View style={styles.modalActions}>
                        <PrimaryButton disabled={device.renameDeviceRequest} mode="text" style={[styles.button, styles.cancelButton]} title="Cancel" onPress={toggleModal} />
                        <PrimaryButton loading={device.renameDeviceRequest} disabled={device.renameDeviceRequest} style={styles.button} title="Rename" onPress={handleSubmit} />
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
        device: state.device
    }
};

export default connect(
    mapStateToProps,
    null
)(RenameDeviceForm)