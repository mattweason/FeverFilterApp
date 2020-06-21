import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "LOGOUT_FAILURE";

export const RESET_EMAIL_REQUEST = "RESET_EMAIL_REQUEST";
export const RESET_EMAIL_SUCCESS = "RESET_EMAIL_SUCCESS";
export const RESET_EMAIL_FAILURE = "RESET_EMAIL_FAILURE";

export const UPDATE_PASSWORD_REQUEST = "UPDATE_PASSWORD_REQUEST";
export const UPDATE_PASSWORD_SUCCESS = "UPDATE_PASSWORD_SUCCESS";
export const UPDATE_PASSWORD_FAILURE = "UPDATE_PASSWORD_FAILURE";

export const UPDATE_PROFILE_REQUEST = "UPDATE_PROFILE_REQUEST";
export const UPDATE_PROFILE_SUCCESS = "UPDATE_PROFILE_SUCCESS";
export const UPDATE_PROFILE_FAILURE = "UPDATE_PROFILE_FAILURE";

export const UPDATE_EMAIL_REQUEST = "UPDATE_EMAIL_REQUEST";
export const UPDATE_EMAIL_SUCCESS = "UPDATE_EMAIL_SUCCESS";
export const UPDATE_EMAIL_FAILURE = "UPDATE_EMAIL_FAILURE";

export const UPDATE_PROFILE_STATE = "UPDATE_PROFILE_STATE";

const requestLogin = () => {
    return {
        type: LOGIN_REQUEST
    };
};

export const receiveLogin = user => {
    return {
        type: LOGIN_SUCCESS,
        user
    };
};

const loginError = error => {
    return {
        type: LOGIN_FAILURE,
        error
    };
};

const requestLogout = () => {
    return {
        type: LOGOUT_REQUEST
    };
};

const receiveLogout = () => {
    return {
        type: LOGOUT_SUCCESS
    };
};

const logoutError = () => {
    return {
        type: LOGOUT_FAILURE
    };
};

const resetEmailRequest = () => {
    return {
        type: RESET_EMAIL_REQUEST
    };
};

const resetEmailSuccess = () => {
    return {
        type: RESET_EMAIL_SUCCESS
    };
};

const resetEmailFailure = () => {
    return {
        type: RESET_EMAIL_FAILURE
    };
};

const updatePasswordRequest = () => {
    return {
        type: UPDATE_PASSWORD_REQUEST
    };
};

const updatePasswordSuccess = () => {
    return {
        type: UPDATE_PASSWORD_SUCCESS
    };
};

const updatePasswordFailure = (error) => {
    return {
        type: UPDATE_PASSWORD_FAILURE,
        error: error
    };
};

const updateEmailRequest = () => {
    return {
        type: UPDATE_EMAIL_REQUEST
    };
};

const updateEmailSuccess = () => {
    return {
        type: UPDATE_EMAIL_SUCCESS
    };
};

const updateEmailFailure = (error) => {
    return {
        type: UPDATE_EMAIL_FAILURE,
        error: error
    };
};

const updateProfileRequest = () => {
    return {
        type: UPDATE_PROFILE_REQUEST
    };
};

const updateProfileSuccess = () => {
    return {
        type: UPDATE_PROFILE_SUCCESS
    };
};

const updateProfileFailure = (error) => {
    return {
        type: UPDATE_PROFILE_FAILURE,
        error: error
    };
};

const updateProfileState = (data) => {
    return {
        type: UPDATE_PROFILE_STATE,
        data
    }
}

export const signIn = (email, password) => async dispatch => {
    dispatch(requestLogin());
    try {
        const response = await auth().signInWithEmailAndPassword(email, password)
        if (response.user.uid) {
            const userDoc = await firestore().collection('accounts').doc(response.user.uid).get();
            const user = userDoc._data;
            user.uid = response.user.uid;
            dispatch(receiveLogin(user));
        }
    } catch (error) {
        dispatch(loginError(error.code));
    }

}

export const signUp = (email, password, phone, name) => async (dispatch, getState) => {
    dispatch(requestLogin());
    const degreeUnit = getState().ui.countryCode === "US" ? "fahrenheit" : "celsius";

    try {
        const response = await auth().createUserWithEmailAndPassword(email, password)
        if (response.user.uid){
            firestore().collection('accounts').doc(response.user.uid).set({
                email,
                phone,
                name,
                degreeUnit,
                devices: []
            }).then(() => {
                console.log('user added')
            });
            dispatch(receiveLogin({uid: response.user.uid, name, email, phone, degreeUnit}));

        }
    } catch (error) {
        dispatch(loginError(error.code));
    }
};

export const logout = () => dispatch => {
    dispatch(requestLogout());
    auth()
        .signOut()
        .then(() => {
            dispatch(receiveLogout());
        })
        .catch(error => {
            //Do something with the error if you want!
            dispatch(logoutError());
        });
};

export const resetPasswordEmail = (email, toggleModal, toggleSuccessModal) => dispatch => {
    dispatch(resetEmailRequest());
    auth().sendPasswordResetEmail(email).then(() => {
        toggleModal();
        dispatch(resetEmailSuccess());
        setTimeout(() => {
            toggleSuccessModal()
        }, 300);
    }).catch((error) => {

        //Act like it's a success to prevent learning active emails
        toggleModal();
        dispatch(resetEmailFailure());
        setTimeout(() => {
            toggleSuccessModal()
        }, 300);
    })
};

export const updatePassword = (userEmail, currentPassword, newPassword, toggleModal, toggleSnackBar) => dispatch => {
    dispatch(updatePasswordRequest());

    const reauthenticate = (currentPassword) => {
        let user = auth().currentUser;
        let cred = auth.EmailAuthProvider.credential(
            userEmail, currentPassword);
        return user.reauthenticateWithCredential(cred);
    };

    reauthenticate(currentPassword).then(() => {
        let user = auth().currentUser;

        user.updatePassword(newPassword).then(() => {
            toggleModal();
            dispatch(updatePasswordSuccess());
            toggleSnackBar('Your password has been updated.');
        }).catch((error) => {
            dispatch(updatePasswordFailure(error.code))
        });

    }).catch((error) => {
        dispatch(updatePasswordFailure(error.code))
    });
};

export const updateEmail = (currentPassword, userEmail, newEmail, toggleModal, toggleSnackBar) => dispatch => {
    dispatch(updateEmailRequest());

    const reauthenticate = (currentPassword) => {
        let user = auth().currentUser;
        let cred = auth.EmailAuthProvider.credential(
            userEmail, currentPassword);
        return user.reauthenticateWithCredential(cred);
    };

    reauthenticate(currentPassword).then(() => {
        let user = auth().currentUser;

        user.updateEmail(newEmail).then(() => {
            toggleModal();
            dispatch(updateEmailSuccess());
            dispatch(updateProfileState({email: newEmail}));

            toggleSnackBar('Your email has been updated.');
        }).catch((error) => {
            dispatch(updateEmailFailure(error.code))
        });

    }).catch((error) => {
        dispatch(updateEmailFailure(error.code))
    });
};

export const updateProfile = (data, uid, callback) => dispatch => {
    dispatch(updateProfileRequest());
    firestore().collection('accounts').doc(uid).update({
        name: data.name,
        phone: data.phone
    }).then(() => {
        dispatch(updateProfileState({name: data.name, phone: data.phone}));
        dispatch(updateProfileSuccess());

        if(callback)
            callback();
    }).catch(err => {
        dispatch(updateProfileFailure())
    });
}

export const updateDegreeUnit = (unit, uid) => dispatch => {
    dispatch(updateProfileRequest());
    firestore().collection('accounts').doc(uid).update({
        degreeUnit: unit
    }).then(() => {
        dispatch(updateProfileState({degreeUnit: unit}));
        dispatch(updateProfileSuccess());
    }).catch(err => {
        dispatch(updateProfileFailure())
    });
}