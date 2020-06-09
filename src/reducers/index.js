import { combineReducers } from 'redux';
import authReducer from "./authReducer";
import uiReducer from "./uiReducer";

const appReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer
});

const rootReducer = (state, action) => {
    return appReducer(state, action);
};

export default rootReducer;