import firestore from '@react-native-firebase/firestore';

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

export const fetchDevices = () => async (dispatch, getState) => {
    dispatch(fetchDevicesRequest())
    const uid = getState().auth.user.uid;

    try {
        const userDoc = await firestore().collection('accounts').doc(uid).get();
        const userData = userDoc._data;
        let devices = [];

        for (let i = 0; i < userData.devices.length; i++){
            const deviceDoc = await userData.devices[i].get();
            if(deviceDoc._data)
                devices.push(deviceDoc._data);
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

    firestore().collection('devices').doc(deviceId).set({
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
            dispatch(fetchDevices());
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
        tempThresh: parseFloat(threshold)
    }).then(() => {
        dispatch(updateThresholdSuccess())
        toggleModal();
        dispatch(fetchDevices());
    }).catch(err => {
        console.log(err)
        dispatch(updateThresholdFailure())
    })
}