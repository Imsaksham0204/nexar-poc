import { configureStore } from '@reduxjs/toolkit';
import signalReducer from '../Reducers/signal.actions';
export const store = configureStore({
    reducer: {
        signal: signalReducer
    },
});
