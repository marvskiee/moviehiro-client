import { SET_TEMP_INFO } from "./watchTypes";

const initialState = {
  temp_info: null,
};

const watchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TEMP_INFO:
      return {
        ...state,
        temp_info: action.payload,
      };

    default:
      return state;
  }
};
export default watchReducer;
