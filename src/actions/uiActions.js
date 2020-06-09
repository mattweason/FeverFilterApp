export const WIFI_CONNECTED = "WIFI_CONNECTED";
export const USER_COUNTRY = "USER_COUNTRY";

import NetInfo from "@react-native-community/netinfo"

export const wifiListener = () => dispatch => {
    const unsubscribe = NetInfo.addEventListener(state => {
        dispatch(wifiConnected(state.isConnected))
    });
}

export const wifiConnected = (isConnected) => dispatch => {
    dispatch({
        type: WIFI_CONNECTED,
        isConnected
    })
}

export const userCountry = (countryCode) => dispatch => {
    dispatch({
        type: USER_COUNTRY,
        countryCode
    })
}