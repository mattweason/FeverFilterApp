import {
    SCANNING_NETWORKS,
    NETWORK_LIST,
    NETWORK_SSID
} from "../actions/wifiActions";

const INITIAL_STATE = {
    networkList: [],
    status: 'inactive',
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'SCANNING_NETWORKS':
            return {
                ...state,
                status: 'scanning'
            };
        case 'NETWORK_LIST':
            return {
                ...state,
                networkList: action.networkList
            };
        case 'NETWORK_SSID':
            return {
                ...state,
                networkSsid: action.networkSsid
            }
        default:
            return state;
    }
};