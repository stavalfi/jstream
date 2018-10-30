import flowStatuses from './statuses/flowStatuses';
import actions from './actions';
import store from './store';

store.dispatch(actions.createUser('wdgh783y83d2', 'createUser', flowStatuses.started));