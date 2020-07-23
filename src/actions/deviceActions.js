import firestore from '@react-native-firebase/firestore';
import moment from 'moment'

export const FETCH_DEVICES_REQUEST = "FETCH_DEVICES_REQUEST";
export const FETCH_DEVICES_SUCCESS = "FETCH_DEVICES_SUCCESS";
export const FETCH_DEVICES_FAILURE = "FETCH_DEVICES_FAILURE";

export const ADD_DEVICE_REQUEST = "ADD_DEVICE_REQUEST";
export const ADD_DEVICE_SUCCESS = "ADD_DEVICE_SUCCESS";
export const ADD_DEVICE_FAILURE = "ADD_DEVICE_FAILURE";

export const RENAME_DEVICE_REQUEST = "RENAME_DEVICE_REQUEST";
export const RENAME_DEVICE_SUCCESS = "RENAME_DEVICE_SUCCESS";
export const RENAME_DEVICE_FAILURE = "RENAME_DEVICE_FAILURE";

export const UPDATE_THRESHOLD_REQUEST = "UPDATE_THRESHOLD_REQUEST";
export const UPDATE_THRESHOLD_SUCCESS = "UPDATE_THRESHOLD_SUCCESS";
export const UPDATE_THRESHOLD_FAILURE = "UPDATE_THRESHOLD_FAILURE";

export const ADD_ISSUE_REQUEST = "ADD_ISSUE_REQUEST";
export const ADD_ISSUE_SUCCESS = "ADD_ISSUE_SUCCESS";
export const ADD_ISSUE_FAILURE = "ADD_ISSUE_FAILURE";

export const UPDATE_WIFI_STATE =  "UPDATE_WIFI_STATE";
export const UPDATE_THRESHOLD_STATE =  "UPDATE_THRESHOLD_STATE";

const fetchDevicesRequest = () => {
    return {
        type: FETCH_DEVICES_REQUEST
    }
}

const fetchDevicesSuccess = (devices) => {
    return {
        type: FETCH_DEVICES_SUCCESS,
        devices
    }
}

const fetchDevicesFailure = () => {
    return {
        type: FETCH_DEVICES_FAILURE
    }
}

const addDeviceRequest = () => {
    return {
        type: ADD_DEVICE_REQUEST
    }
}

const addDeviceSuccess = () => {
    return {
        type: ADD_DEVICE_SUCCESS
    }
}

const addDeviceFailure = () => {
    return {
        type: ADD_DEVICE_FAILURE
    }
}

const renameDeviceRequest = () => {
    return {
        type: RENAME_DEVICE_REQUEST
    }
}

const renameDeviceSuccess = () => {
    return {
        type: RENAME_DEVICE_SUCCESS
    }
}

const renameDeviceFailure = () => {
    return {
        type: RENAME_DEVICE_FAILURE
    }
}

const updateThresholdRequest = () => {
    return {
        type: UPDATE_THRESHOLD_REQUEST
    }
}

const updateThresholdSuccess = () => {
    return {
        type: UPDATE_THRESHOLD_SUCCESS
    }
}

const updateThresholdFailure = () => {
    return {
        type: UPDATE_THRESHOLD_FAILURE
    }
}

const addIssueRequest = () => {
    return {
        type: ADD_ISSUE_REQUEST
    }
}

const addIssueSuccess = () => {
    return {
        type: ADD_ISSUE_SUCCESS
    }
}

const addIssueFailure = () => {
    return {
        type: ADD_ISSUE_FAILURE
    }
}

export const fetchDevices = (deviceId = '') => async (dispatch, getState) => {
    dispatch(fetchDevicesRequest())
    const uid = getState().auth.user.uid;

    try {
        const userDoc = await firestore().collection('accounts').doc(uid).get();
        const userData = userDoc._data;
        let devices = [];

        for (let i = 0; i < userData.devices.length; i++){
            const deviceDoc = await userData.devices[i].get();
            if(deviceDoc._data){
                devices.push(deviceDoc._data);
                if(deviceId) //If fetch devices call was triggered by add device
                    dispatch(watchWifiState(deviceId))

                if(deviceDoc._data.threshUpdated){
                    let updateTime = deviceDoc._data.threshUpdated.toDate();
                    let retrieveTime = deviceDoc._data.timestamp.toDate();
                    let pending = moment(retrieveTime).isBefore(updateTime);
                    if(pending)
                        dispatch(watchTimestamp(deviceDoc._data.deviceId));
                }
            }
        }

        if (!devices.length)
            devices = null;

        dispatch(fetchDevicesSuccess(devices))
    }
    catch {
        dispatch(fetchDevicesFailure())
    }

}

export const addDevice = (deviceId, deviceName, deviceToken, navigation) => (dispatch, getState) => {
    dispatch(addDeviceRequest())
    const uid = getState().auth.user.uid;
    console.log(uid)

    firestore().collection('devices').doc(deviceId).set({
        uid,
        deviceId,
        tempThresh: 37.5,
        deviceName,
        deviceToken,
        wifiState: null
    }).then(() => {
        const deviceRef = firestore().collection('devices').doc(deviceId);
        firestore().collection('accounts').doc(uid).update({
            devices: firestore.FieldValue.arrayUnion(deviceRef)
        }).then(() => {
            dispatch(addDeviceSuccess())
            dispatch(fetchDevices(deviceId));
            navigation.goBack(null);
        })
    }).catch(err => {
        console.log(err)
        dispatch(addDeviceFailure())
    });
}

export const renameDevice = (deviceId, deviceName, toggleModal) => dispatch => {
    dispatch(renameDeviceRequest())

    firestore().collection('devices').doc(deviceId).update({
        deviceName: deviceName
    }).then(() => {
        dispatch(renameDeviceSuccess())
        toggleModal();
        dispatch(fetchDevices());
    }).catch(err => {
        console.log(err)
        dispatch(renameDeviceFailure())
    })
}

export const updateThreshold = (deviceId, threshold, toggleModal) => dispatch => {
    dispatch(updateThresholdRequest())

    firestore().collection('devices').doc(deviceId).update({
        tempThresh: parseFloat(threshold),
        threshUpdated: firestore.Timestamp.now()
    }).then(() => {
        dispatch(updateThresholdSuccess())
        toggleModal();
        dispatch(fetchDevices());
        dispatch(watchTimestamp(deviceId))
    }).catch(err => {
        console.log(err)
        dispatch(updateThresholdFailure())
    })
}

//Watch for timestamp field to update
export const watchTimestamp = (deviceId) => dispatch => {
    dispatch(updateThresholdState('pending', deviceId));
    let unsubscribeTimestampListener = firestore().collection("devices").doc(deviceId)
        .onSnapshot(function(doc) {
            let data = doc.data();

            let updateTime = data.threshUpdated.toDate();
            let retrieveTime = data.timestamp.toDate();

            // moment('2010-10-20').isAfter('2010-10-19'); // true

            let complete = moment(retrieveTime).isAfter(moment(updateTime).add(5, 'm'))
            let updated = moment(retrieveTime).isAfter(updateTime);
            let pending = moment(retrieveTime).isBefore(updateTime);

            if(complete) {
                dispatch(updateThresholdState('null', deviceId));
                unsubscribe()
            } else if(updated) {
                dispatch(updateThresholdState('updated', deviceId));
            } else if(pending) {
                dispatch(updateThresholdState('pending', deviceId));
            }
        });

    function unsubscribe() {
        unsubscribeTimestampListener();
    }
}

const updateThresholdState = (status, deviceId) => {
    return {
        type: UPDATE_THRESHOLD_STATE,
        status,
        deviceId
    }
}

export const addNewIssue = (title, content, toggleModal) => (dispatch, getState) => {
    dispatch(addIssueRequest())

    const {uid, name, email, phone} = getState().auth.user;

    const issueRef = firestore().collection('issueReports').doc()

    issueRef.set({title, content, uid, name, email, phone,
        timestamp: firestore.FieldValue.serverTimestamp()
    }).then(() => {
        dispatch(addIssueSuccess())
        toggleModal("success")
    }).catch(err => {
        console.log(err)
        dispatch(addIssueFailure())
    })
}

export const watchWifiState = (deviceId) => dispatch => {
    let unsubscribeWifiListener = firestore().collection("devices").doc(deviceId)
        .onSnapshot(function(doc) {
            let data = doc.data();
            if(data.wifiState !== null){
                dispatch(updateWifiState(data.wifiState, deviceId))
                unsubscribe()
            }
        });

    function unsubscribe() {
        unsubscribeWifiListener();
    }
}

const updateWifiState = (wifiState, deviceId) => {
    return {
        type: UPDATE_WIFI_STATE,
        wifiState,
        deviceId
    }
}