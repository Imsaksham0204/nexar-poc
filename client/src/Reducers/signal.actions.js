import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    signalData: null,
};

const signalSlice = createSlice({
    name: "signal",
    initialState,
    reducers: {
        fetchSignalDataStart: (state) => {
            state.loading = true;
        },
        fetchSignalDataSuccess: (state, action) => {
            state.loading = false;
            state.signalData = action.payload;
        },
        fetchSignalDataFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetSignalState: (state) => {
            state.loading = false;
            state.signalData = null;
        }
    }
});

export const {
    fetchSignalDataStart,
    fetchSignalDataSuccess,
    fetchSignalDataFailure,
    resetSignalState
} = signalSlice.actions;

export default signalSlice.reducer;
