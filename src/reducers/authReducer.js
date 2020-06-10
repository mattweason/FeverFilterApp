import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    RESET_EMAIL_REQUEST,
    RESET_EMAIL_SUCCESS,
    RESET_EMAIL_FAILURE
} from "../actions/authActions";

export default (state = {
    isLoggingIn: false,
    isLoggingOut: false,
    isVerifying: false,
    loginError: {},
    logoutError: false,
    isAuthenticated: false,
    user: null
}, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return {
                ...state,
                isLoggingIn: true,
                loginError: false
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                isLoggingIn: false,
                isAuthenticated: true,
                user: action.user
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                isLoggingIn: false,
                isAuthenticated: false,
                loginError: true,
                loginErrorMessage: action.error
            };
        case LOGOUT_REQUEST:
            return {
                ...state,
                isLoggingOut: true,
                logoutError: false
            };
        case LOGOUT_SUCCESS:
            return {
                ...state,
                isLoggingOut: false,
                isAuthenticated: false,
                user: null
            };
        case LOGOUT_FAILURE:
            return {
                ...state,
                isLoggingOut: false,
                logoutError: true
            };
        case RESET_EMAIL_REQUEST:
            return {
                ...state,
                isSendingResetEmail: true,
                resetEmailError: false,
                resetEmailSent: false
            };
        case RESET_EMAIL_SUCCESS:
            return {
                ...state,
                isSendingResetEmail: false,
                resetEmailSent: true
            };
        case RESET_EMAIL_FAILURE:
            return {
                ...state,
                isSendingResetEmail: false,
                resetEmailError: true
            };
        default:
            return state
    }
}