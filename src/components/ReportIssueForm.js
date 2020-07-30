import CustomTextInput from "./CustomTextInput";
import {View, StyleSheet, Text} from "react-native";
import PrimaryButton from "./PrimaryButton";
import {Formik} from "formik";
import React from "react";
import * as Yup from "yup";
import {connect} from "react-redux";
import template from "../styles/styles";

const ReportIssueForm = ({handleSubmit, toggleModal, device, ui}) => {
    //Input refs used for focus on next input when Next is pressed
    let titleRef = {};
    let contentRef = {};

    const changePasswordValidationSchema = Yup.object().shape({
        title: Yup.string()
            .label('Type of Issue')
            .required(),
        content: Yup.string()
            .label('Issue Description')
            .required()
    });

    return (
        <Formik
            initialValues={{ title: "", content: ""}}
            onSubmit={values => {
                handleSubmit(values.title, values.content)
            }}
            validationSchema={changePasswordValidationSchema}
        >
            {({ handleChange, values, handleSubmit, setFieldTouched, touched, errors}) => (
                <>
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Type of Issue"
                        value={values.title}
                        onChangeText={handleChange('title')}
                        returnKeyType="next"
                        input={input => titleRef = input}
                        onSubmitEditing={() => contentRef.focus()}
                        focusHandler={() => {}}
                        blurOnSubmit={false}
                        blurHandler={() => setFieldTouched('title')}
                        error={touched.title && errors.title}
                    />
                    <CustomTextInput
                        style={template.textInput}
                        mode='outlined'
                        label="Issue Description"
                        value={values.content}
                        onChangeText={handleChange('content')}
                        multiline={true}
                        numberOfLines={5}
                        returnKeyType="go"
                        input={input => contentRef = input}
                        onSubmitEditing={() => {
                            contentRef.blur();
                            handleSubmit();
                        }}
                        focusHandler={() => {}}
                        blurOnSubmit={false}
                        blurHandler={() => setFieldTouched('content')}
                        error={touched.content && errors.content}
                    />
                    { !ui.isConnected ? (
                        <Text style={template.networkError}>No network connection detected.</Text>
                    ) : null }
                    <View style={styles.modalActions}>
                        <PrimaryButton disabled={device.addIssueRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                        <PrimaryButton loading={device.addIssueRequest} disabled={device.addIssueRequest || !ui.isConnected} style={styles.button} title="Submit" onPress={() => {handleSubmit()}} />
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
        device: state.device,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    null
)(ReportIssueForm)