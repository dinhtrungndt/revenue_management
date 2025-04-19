import { combineReducers } from 'redux';
import adminReducer from './adminReducer';

const rootReducer = combineReducers({
  adminReducer: adminReducer,
});

export default rootReducer;