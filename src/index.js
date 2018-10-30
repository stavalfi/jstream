import flowStatuses from "./statuses/flowStatuses";
import actions from './actions';
import store from './store';

store.dispatch(actions.a("1", "a", flowStatuses.started));