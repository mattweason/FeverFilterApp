import auth from '@react-native-firebase/auth';

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "LOGOUT_FAILURE";

export const RESET_EMAIL_REQUEST = "RESET_EMAIL_REQUEST";
export const RESET_EMAIL_SUCCESS = "RESET_EMAIL_SUCCESS";
export const RESET_EMAIL_FAILURE = "RESET_EMAIL_FAILURE";

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

export const signIn = (email, password) => async dispatch => {
    dispatch(requestLogin());
    try {
        const response = await auth().signInWithEmailAndPassword(email, password)
        if (response.user.uid) {
            dispatch(receiveLogin(response.user));
        }
    } catch (error) {
        dispatch(loginError(error.code));
    }

}

export const signUp = (email, password) => async dispatch => {
    dispatch(requestLogin());
    try {
        const response = await auth().createUserWithEmailAndPassword(email, password)
        if (response.user.uid){
            dispatch(receiveLogin(response.user));
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