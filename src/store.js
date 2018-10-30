import {applyMiddleware, compose, createStore} from "redux";
import middleware from "./middleware";
import reducer from "./recucer";

export default createStore(reducer, compose(applyMiddleware(middleware)));