import { configureStore } from '@reduxjs/toolkit';
import signalReducer from '../Reducers/signal.actions';
import connectionReducer from '../Reducers/Connection/connection.reducer';
export const store = configureStore({
    reducer: {
        signal: signalReducer,
        connection: connectionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "connection/onSocketConnect",
                    "connection/onSocketDisconnect",
                ],
                ignoredPaths: ["connection.socketConnection"],
            },
        }),
});
