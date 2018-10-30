import {applyMiddleware, compose, createStore} from "redux";
import middleware from "./middleware";
import reducer from "./recucer";
import { install } from 'redux-loop';

export default createStore(reducer, compose(applyMiddleware(middleware),install()));