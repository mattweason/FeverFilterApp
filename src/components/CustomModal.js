import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet, Keyboard, TouchableWithoutFeedback, Platform} from 'react-native';
import Modal from 'react-native-modal';
import theme from '../styles/theme.styles';
import CloseButton from "./CloseButton"
import PrimaryButton from "./PrimaryButton";

const CustomModal = ({
     visible,
     loading,
     toggleModal,
     cancelButton,
     confirmButton,
     title,
     subTitle,
     content,
     noClose,
     noDismiss,
     customBackButton = null,
     onModalHide}) => {

    const [keyboardShown, setKeyboardShown] = useState(!noClose)

    let keyboardDidShowSub = '';
    let keyboardDidHideSub = '';

    useEffect(() => {
        keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

        return () => {
            keyboardDidShowSub.remove();
            keyboardDidHideSub.remove();
        }
    }, []);

    const handleKeyboardDidShow = () => {
        setKeyboardShown(true);
    };

    const handleKeyboardDidHide = () => {
        setKeyboardShown(false);
    };

    return (
        <Modal
            isVisible={visible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            avoidKeyboard={Platform.OS === 'ios'}
            backdropTransitionOutTiming={0}
            onBackdropPress={ (keyboardShown || noDismiss) ? null : toggleModal}
            onBackButtonPress={ customBackButton ? customBackButton : (keyboardShown ? null : toggleModal)}
            onModalHide={onModalHide}
            loading={loading}
        >
            <TouchableWithoutFeedback onPress={() => {if(keyboardShown) {Keyboard.dismiss()}}} accessible={false}>
                <View style={styles.card}>
                    { !noClose && (
                        <View style={styles.closeButton} >
                            <CloseButton closeAction={toggleModal} />
                        </View>
                    )}
                    { title ? <Text style={styles.title}>{title}</Text> : null }
                    { subTitle ? <Text style={styles.subTitle}>{subTitle}</Text> : null }
                    { content }
                    { confirmButton.action ?
                        <View style={styles.modalActions}>
                            { cancelButton ? <PrimaryButton disabled={loading} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} /> : null }
                            <PrimaryButton disabled={loading} loading={loading} style={styles.button} title={confirmButton.title} onPress={confirmButton.action} />
                        </View>
                        : null }
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2
    },
    title: {
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold',
        fontSize: 20,
    },
    subTitle: {
        marginTop: 6,
        color: theme.COLOR_LIGHTGREY,
        fontFamily: 'Lato',
        fontSize: 16
    },
    modalActions: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 8
    },
    button: {
        flex: 1
    },
    cancelButton: {
        marginRight: 12
    }
})

//Cancel button is an optional prop. If you don't add the cancelButton prop the only modal action will be the confirm button.
//Confirm button is also an optional prop. If you don't supply confirm button there will be no modal actions.
//When using formik forms in a modal, you must supply your own modal actions in the form, given formik's handleSubmit prop

CustomModal.defaultProps = {
    cancelButton: {
        text: 'Cancel'
    },
    confirmButton: {
        action: null,
        text: 'Ok'
    },
    onModalHide: () => {}
}

export default CustomModal;