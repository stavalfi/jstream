import {of, empty} from 'optional-js';

const getFirstBy = (array, predicate) =>
    of(array.findIndex(predicate))
        .flatMap(index => index > -1 ? of(array[index]) : empty());

export {getFirstBy};