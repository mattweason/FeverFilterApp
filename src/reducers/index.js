import { combineReducers } from 'redux';
import authReducer from "./authReducer";
import uiReducer from "./uiReducer";
import wifiReducer from "./wifiReducer";
import bleReducer from "./bleReducer";
import deviceReducer from "./deviceReducer";

const appReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    wifi: wifiReducer,
    ble: bleReducer,
    device: deviceReducer
});

const rootReducer = (state, action) => {
    return appReducer(state, action);
};

export default rootReducer;