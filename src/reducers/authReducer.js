import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGOUT_REQUEST,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE,
    RESET_EMAIL_REQUEST,
    RESET_EMAIL_SUCCESS,
    RESET_EMAIL_FAILURE,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_FAILURE,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAILURE,
    UPDATE_EMAIL_REQUEST,
    UPDATE_EMAIL_SUCCESS,
    UPDATE_EMAIL_FAILURE,
    UPDATE_PROFILE_STATE
} from "../actions/authActions";

export default (state = {
    isLoggingIn: false,
    isLoggingOut: false,
    isVerifying: false,
    loginError: {},
    logoutError: false,
    isAuthenticated: false,
    user: null,
    plan: {
        planId: null
    }
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
        case UPDATE_PROFILE_REQUEST:
            return {
                ...state,
                updateProfileRequest: true,
                updateProfileSuccess: false,
                updateProfileFailure: false
            };
        case UPDATE_PROFILE_SUCCESS:
            return {
                ...state,
                updateProfileRequest: false,
                updateProfileSuccess: true
            };
        case UPDATE_PROFILE_FAILURE:
            return {
                ...state,
                updateProfileRequest: false,
                updateProfileSuccess: false,
                updateProfileFailure: true
            };
        case UPDATE_EMAIL_REQUEST:
            return {
                ...state,
                updateEmailRequest: true,
                updateEmailSuccess: false,
                updateEmailFailure: false
            };
        case UPDATE_EMAIL_SUCCESS:
            return {
                ...state,
                updateEmailRequest: false,
                updateEmailSuccess: true
            };
        case UPDATE_EMAIL_FAILURE:
            return {
                ...state,
                updateEmailRequest: false,
                updateEmailSuccess: false,
                updateEmailFailure: true,
                updateEmailErrorMessage: action.error
            };
        case UPDATE_PASSWORD_REQUEST:
            return {
                ...state,
                updatePasswordRequest: true,
                updatePasswordSuccess: false,
                updatePasswordFailure: false
            };
        case UPDATE_PASSWORD_SUCCESS:
            return {
                ...state,
                updatePasswordRequest: false,
                updatePasswordSuccess: true
            };
        case UPDATE_PASSWORD_FAILURE:
            return {
                ...state,
                updatePasswordRequest: false,
                updateEPasswordSuccess: false,
                updatePasswordFailure: true,
                updatePasswordErrorMessage: action.error
            };
        case UPDATE_PROFILE_STATE:
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.data
                }
            }
        default:
            return state
    }
}