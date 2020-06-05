import { combineReducers } from 'redux';
import authReducer from "./authReducer";

const appReducer = combineReducers({
    auth: authReducer
});

const rootReducer = (state, action) => {
    return appReducer(state, action);
};

export default rootReducer;