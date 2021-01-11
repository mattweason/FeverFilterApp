import {
    WIFI_CONNECTED,
    USER_COUNTRY,
    NEW_DEVICE_READY,
    SELECTED_SUBSCRIPTION_TIER,
    SUBSCRIPTION_DOWNGRADE
} from '../actions/uiActions'

export default (state = {
    isConnected: true,
    countryCode: 'US'
}, action) => {
    switch (action.type) {
        case WIFI_CONNECTED:
            return {
                ...state,
                isConnected: action.isConnected
            }
        case USER_COUNTRY:
            return {
                ...state,
                countryCode: action.countryCode
            }
        case NEW_DEVICE_READY:
            return {
                ...state,
                newDeviceReady: action.bool
            }
        case SUBSCRIPTION_DOWNGRADE:
            return {
                ...state,
                subscriptionDowngrade: action.bool,
                pendingTier: action.pendingTier,
                currentTier: action.currentTier,

            }
        default:
            return state
    }
}