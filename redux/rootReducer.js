import { combineReducers } from "redux";
import favoriteReducer from "./favorite/favoriteReducers";
import watchReducer from "./watch/watchReducers";

const rootReducer = combineReducers({
  favorite: favoriteReducer,
  watch: watchReducer,
});

export default rootReducer;
