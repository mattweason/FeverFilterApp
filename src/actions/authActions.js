import auth from '@react-native-firebase/auth';

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAILURE = "LOGOUT_FAILURE";

export const VERIFY_REQUEST = "VERIFY_REQUEST";
export const VERIFY_SUCCESS = "VERIFY_SUCCESS";

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

const verifyRequest = () => {
    return {
        type: VERIFY_REQUEST
    };
};

const verifySuccess = () => {
    return {
        type: VERIFY_SUCCESS
    };
};

export const signIn = (email, password, navigation) => async dispatch => {
    // dispatch(requestLogin());
    // try {
    //     const response = await myFirebase.auth().signInWithEmailAndPassword(email, password)
    //     if (response.user.uid) {
    //         dispatch(receiveLogin(response.user));
    //         navigation.navigate('Home');
    //
    //         dispatch(fetchData((data) => {
    //             if (!data.customerInformation.address)
    //                 navigation.navigate('AdditionalInfo');
    //         }))
    //     }
    // } catch (error) {
    //     dispatch(loginError(error.code));
    // }

}

export const signUp = (email, password, navigation) => async dispatch => {
    // dispatch(requestLogin());
    // try {
    //     const response = await myFirebase.auth().createUserWithEmailAndPassword(email, password)
    //     if (response.user.uid){
    //         const uid = response.user.uid;
    //
    //         //Initialize customerInformation and weather
    //         dispatch(initAccount(uid, response.user, navigation));
    //     }
    // } catch (error) {
    //     console.log(error)
    //     dispatch(loginError(error.code));
    // }
};

export const logout = (navigation) => dispatch => {
    // dispatch(requestLogout());
    // myFirebase
    //     .auth()
    //     .signOut()
    //     .then(() => {
    //         navigation.navigate('Auth')
    //         dispatch(receiveLogout());
    //     })
    //     .catch(error => {
    //         console.log(error)
    //         //Do something with the error if you want!
    //         dispatch(logoutError());
    //     });
};

export const verifyAuth = (navigation) => dispatch => {
    dispatch(verifyRequest());
    const unsubscribe = auth().onAuthStateChanged(user => {
        if (user !== null) {
            dispatch(receiveLogin(user));
            unsubscribe();
        } else {
            unsubscribe();
            navigation.navigate('Auth')
        }
        dispatch(verifySuccess());
    });
};