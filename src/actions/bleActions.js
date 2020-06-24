import { newDeviceReady } from "./uiActions";
import base64 from 'react-native-base64';

export const CONNECTED_DEVICE = "CONNECTED_DEVICE";
export const DEVICE_DISCONNECTED = "DEVICE_DISCONNECTED";
export const CHANGE_STATUS = "CHANGE_STATUS";
export const CONNECTION_ERROR = "CONNECTION_ERROR";
export const CLEAR_CONNECTION_ERROR = "CLEAR_CONNECTION_ERROR";
export const SCANNED_DEVICE_ID = "SCANNED_DEVICE_ID";

export const scannedDeviceId = (deviceId) => ({
    type: SCANNED_DEVICE_ID,
    deviceId
})

export const connectedDevice = (device) => ({
    type: CONNECTED_DEVICE,
    device
});

export const deviceDisconnected = () => dispatch => {
    dispatch({
        type: DEVICE_DISCONNECTED
    })
}

export const changeStatus = (status) => ({
    type: CHANGE_STATUS,
    status
});

export const connectionError = (error) => dispatch => {
    dispatch(stopScan())
    dispatch({
        type: CONNECTION_ERROR,
        error
    })
}

export const clearConnectionError = () => dispatch => {
    dispatch({
        type: CLEAR_CONNECTION_ERROR
    })
}

export const startScan = (bleID) => {
    return (dispatch, getState, DeviceManager) => {

        const subscription = DeviceManager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                dispatch(scan(bleID));
                subscription.remove();
            } else if (state === 'PoweredOff'){
                DeviceManager.enable()
            }
        }, true);
    };
}

//Init timeout globally
let timeout;

export const scan = (bleID) => {

    return (dispatch, getState, DeviceManager) => {
        DeviceManager.startDeviceScan(null, null, (error, device) => {
            dispatch(changeStatus("Scanning"));
            if (error) {
                clearTimeout(timeout)
                dispatch(connectionError(error))
            }
            if (device.name === bleID) {
                clearTimeout(timeout)
                dispatch(connectDevice(device))
            }
        });

        //Cancel scanning after 30 seconds
        timeout = setTimeout(() => {
            dispatch(connectionError("Could not find the scanned device. Check to make sure it is on and scan again."))
        }, 30000)
    }
}

export const stopScan = () => {
    return (dispatch, getState, DeviceManager) => {
        dispatch(changeStatus("Stopped scan"));
        DeviceManager.stopDeviceScan();
    }
}

let connectionAttempts = 0;

export const connectDevice = (device) => {
    return (dispatch, getState, DeviceManager) => {

        dispatch(changeStatus("Connecting"));

        //No need to scan now that we found the device
        DeviceManager.stopDeviceScan()

        device.connect()
            .then( async (device) => {
                dispatch(changeStatus("Discovering"));

                await device.discoverAllServicesAndCharacteristics()

                return device;
            })
            .then((device) => {

                dispatch(changeStatus("Setting Notifications"));

                return device;
            })
            .then((device) => {
                dispatch(changeStatus("Listening"));
                dispatch(connectedDevice(device))
                dispatch(handleDisconnect(device))

                connectionAttempts = 0;

                return device;
            }, (error) => {
                if(connectionAttempts < 10){
                    connectionAttempts++;
                    dispatch(connectDevice(device))
                } else {
                    dispatch(connectionError('Could not connect to device. Please try again.'))
                }
            })
    }
};

const handleDisconnect = (device) => {
    return (dispatch, getState, DeviceManager) => {
        const subscription = DeviceManager.onDeviceDisconnected(device.id, (error, device) => {
            subscription.remove();
            dispatch(changeStatus('lost connection'));
        });
    }
}

export const disconnect = () => {
    return async (dispatch, getState, DeviceManager) => {
        const device = getState().ble.device;

        if (device.hasOwnProperty('_manager')) {
            const connected = await DeviceManager.isDeviceConnected(device.id);

            if (connected)
                await DeviceManager.cancelDeviceConnection(device.id);

            dispatch(deviceDisconnected());
            dispatch(changeStatus("disconnected"));
        }
    }
}

export const sendWifiCharacteristic = (credentials, deviceToken) => {
    return async (dispatch, getState, DeviceManager) => {
        const device = getState().ble.device;
        const serviceUUID = "000000ff-0000-1000-8000-00805f9b34fb";
        const writeCharacteristicUUID = "0000ee01-0000-1000-8000-00805f9b34fb";
        const readCharacteristiUUID = "0000ff01-0000-1000-8000-00805f9b34fb";

        //BLE characteristics can only be 20 characters in length.
        //We need to split the ssid and passwords into the appropriate characteristics if they are too long
        //Characteristics start with an identifier:
        //    0 == short SSID
        //    1 == long SSID part 1
        //    2 == long SSID part 2
        //    3 == short password
        //    4 == long password part 1
        //    5 == long password 2
        //The FeverFilter device will read these identifiers and act accordingly
        //Characteristics values also need to be base64 encoded before sending

        let ssid = [];
        let password = [];

        for(let i = 0; i < (credentials.ssid.length / 19); i++) {
            ssid.push("1" + credentials.ssid.slice(i*19,(i+1)*19))
        }

        for(let i = 0; i < (credentials.password.length / 19); i++) {
            password.push("3" + credentials.password.slice(i*19,(i+1)*19))
        }

        //Make sure device is connected
        const connected = await DeviceManager.isDeviceConnected(device.id);

        if(!connected)
            dispatch(changeStatus("disconnected"))
        else{
            dispatch(changeStatus("SendingCharacteristic"))

            //deviceToken write command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("0"));

            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("5" + deviceToken));

            //deviceToken end string command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("6"));

            //Start wifi credential write command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("0"));

            for(let i = 0; i < ssid.length; i++) {
                await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode(ssid[i]));
            }

            //Ssid end string command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("2"));

            //Start password credential write command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("0"));

            for(let i = 0; i < password.length; i++) {
                await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode(password[i]));
            }

            //Ssid end string command
            await device.writeCharacteristicWithResponseForService(serviceUUID, writeCharacteristicUUID, base64.encode("4"));

            //Every 3 seconds for 12 seconds, check if we have a successful wifi connection.
            //Reading the characteristic will return 0 for not connected, and 1 for connected
            let count = 0;
            let interval = setInterval(() => {
                count++;

                device.readCharacteristicForService(serviceUUID, readCharacteristiUUID).then( async (data) => {
                    const response = base64.decode(data.value);
                    let wifiNote = response.substr(0,1);
                    if(wifiNote === "1"){

                        //Signal process successfully completed
                        dispatch(changeStatus('CharacteristicReceived'))
                        dispatch(newDeviceReady(true))
                        clearInterval(interval)
                    } else {
                        if(count === 6){
                            clearInterval(interval)
                            dispatch(changeStatus('CharacteristicFailed'))
                        }
                    }
                })
            }, 3000)
        }
    }
}