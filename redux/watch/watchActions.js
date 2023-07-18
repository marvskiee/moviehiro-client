import { SET_TEMP_INFO } from "./watchTypes";

export const tempInfo = (data) => {
  return {
    type: SET_TEMP_INFO,
    payload: data,
  };
};

export const setTempInfo = (data) => (dispatch) => {
  dispatch(tempInfo(data));
};
