import * as WifiManager from 'react-native-wifi-reborn';

export const SCANNING_NETWORKS = "SCANNING_NETWORKS";
export const NETWORK_LIST = "NETWORK_LIST"
export const NETWORK_SSID = "NETWORK_SSID"

export const scanningNetworks = () => ({
    type: SCANNING_NETWORKS
})

const networkList = (networkList) => ({
    type: NETWORK_LIST,
    networkList
})

const networkSsid = (networkSsid) => ({
    type: NETWORK_SSID,
    networkSsid
})


export const scanNetworks = () => async dispatch => {
    dispatch(scanningNetworks);
    let wifiList = await WifiManager.default.loadWifiList();
    let wifiArray =  JSON.parse(wifiList);
    dispatch(networkList(wifiArray))
}

export const getNetwork = () => async dispatch => {
    const ssid = await WifiManager.default.getCurrentWifiSSID();
    dispatch(networkSsid(ssid))
}