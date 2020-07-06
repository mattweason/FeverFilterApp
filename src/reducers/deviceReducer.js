import {
    FETCH_DEVICES_REQUEST,
    FETCH_DEVICES_SUCCESS,
    FETCH_DEVICES_FAILURE,
    ADD_DEVICE_REQUEST,
    ADD_DEVICE_SUCCESS,
    ADD_DEVICE_FAILURE,
    RENAME_DEVICE_REQUEST,
    RENAME_DEVICE_SUCCESS,
    RENAME_DEVICE_FAILURE,
    UPDATE_THRESHOLD_REQUEST,
    UPDATE_THRESHOLD_SUCCESS,
    UPDATE_THRESHOLD_FAILURE,
    ADD_ISSUE_REQUEST,
    ADD_ISSUE_SUCCESS,
    ADD_ISSUE_FAILURE
} from "../actions/deviceActions";

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_DEVICES_REQUEST:
            return {
                ...state,
                fetchDevicesRequest: true,
                fetchDevicesFailure: false,
                fetchDevicesSuccess: false
            };
        case FETCH_DEVICES_SUCCESS:
            return {
                ...state,
                fetchDevicesRequest: false,
                fetchDevicesSuccess: true,
                devices: action.devices
            };
        case FETCH_DEVICES_FAILURE:
            return {
                ...state,
                fetchDevicesRequest: false,
                fetchDevicesFailure: true,
            };
        case ADD_DEVICE_REQUEST:
            return {
                ...state,
                addDeviceRequest: true,
                addDeviceFailure: false,
                addDeviceSuccess: false
            };
        case ADD_DEVICE_SUCCESS:
            return {
                ...state,
                addDeviceRequest: false,
                addDeviceSuccess: true
            };
        case ADD_DEVICE_FAILURE:
            return {
                ...state,
                renameDeviceRequest: false,
                renameDeviceFailure: true,
            };
        case RENAME_DEVICE_REQUEST:
            return {
                ...state,
                renameDeviceRequest: true,
                renameDeviceFailure: false,
                renameDeviceSuccess: false
            };
        case RENAME_DEVICE_SUCCESS:
            return {
                ...state,
                renameDeviceRequest: false,
                renameDeviceSuccess: true,
            };
        case RENAME_DEVICE_FAILURE:
            return {
                ...state,
                renameDeviceRequest: false,
                renameDeviceFailure: true,
            };
        case UPDATE_THRESHOLD_REQUEST:
            return {
                ...state,
                updateThresholdRequest: true,
                updateThresholdFailure: false,
                updateThresholdSuccess: false
            };
        case UPDATE_THRESHOLD_SUCCESS:
            return {
                ...state,
                updateThresholdRequest: false,
                updateThresholdSuccess: true,
            };
        case UPDATE_THRESHOLD_FAILURE:
            return {
                ...state,
                updateThresholdRequest: false,
                updateThresholdFailure: true,
            };
        case ADD_ISSUE_REQUEST:
            return {
                ...state,
                addIssueRequest: true,
                addIssueFailure: false,
                addIssueSuccess: false
            }
        case ADD_ISSUE_SUCCESS:
            return{
                ...state,
                addIssueRequest: false,
                addIssueSuccess: true
            }
        case ADD_ISSUE_FAILURE:
            return{
                ...state,
                addIssueRequest: false,
                addIssueFailure: true
            }
        default:
            return state
    }
}