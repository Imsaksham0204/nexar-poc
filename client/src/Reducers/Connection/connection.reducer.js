import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    socketConnection: null,
    error: null,
};

const connectionSlice = createSlice({
    name: "connection",
    initialState,
    reducers: {
        fetchConnectionDataStart: (state) => {
            state.loading = true;
        },
        onSocketConnect: (state, action) => {
            console.log("onSocketConnect action payload:", action.payload);
            state.loading = false;
            state.error = null;
            state.socketConnection = action.payload;
        },
        onSocketDisconnect: (state) => {
            state.loading = false;
            state.socketConnection = null;
        },
        fetchConnectionDataFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetConnectionState: (state) => {
            state.loading = false;
            state.socketConnection = null;
            state.error = null;
        }
    }
});

export const {
    fetchConnectionDataStart,
    onSocketConnect,
    onSocketDisconnect,
    fetchConnectionDataFailure,
    resetConnectionState
} = connectionSlice.actions;

export default connectionSlice.reducer;
