import {
    WIFI_CONNECTED,
    USER_COUNTRY
} from '../actions/uiActions'

export default (state = {
    isConnected: true,
    countryCode: 'USA'
}, action) => {
    switch (action.type) {
        case WIFI_CONNECTED:
            return {
                ...state,
                isConnected: action.isConnected
            }
        case USER_COUNTRY: {
            return {
                ...state,
                countryCode: action.countryCode
            }
        }
        default:
            return state
    }
}