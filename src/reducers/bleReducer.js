import {
    CONNECTED_DEVICE,
    DEVICE_DISCONNECTED,
    CHANGE_STATUS,
    CONNECTION_ERROR,
    CLEAR_CONNECTION_ERROR,
    SCANNED_DEVICE_ID
} from '../actions/bleActions'

const INITIAL_STATE = {
    device: {},
    status: 'not connected',
    error: ''
};

export default (state =INITIAL_STATE, action) => {
    switch (action.type) {
        case CONNECTED_DEVICE:
            return {
                ...state,
                device: action.device
            };
        case CHANGE_STATUS:
            return {
                ...state,
                device: state.device,
                status: action.status
            };
        case CONNECTION_ERROR:
            return {
                ...state,
                error: action.error
            }
        case CLEAR_CONNECTION_ERROR:
            return {
                ...state,
                error: ''
            }
        case DEVICE_DISCONNECTED:
            return {
                ...state,
                device: {}
            }
        case SCANNED_DEVICE_ID: {
            return {
                ...state,
                scannedDeviceId: action.deviceId
            }
        }
        default:
            return state;
    }
};