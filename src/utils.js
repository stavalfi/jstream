import Optional from 'optional-js';

const getFirstBy = (array, predicate) => {
    return Optional.of(array.findIndex(predicate))
        .flatMap(index => index > -1 ? Optional.of(array[index]) : Optional.empty());
};
const getFirstIndexBy = (array, predicate) => {
    return Optional.of(array.findIndex(predicate))
        .flatMap(index => index > -1 ? Optional.of(index) : Optional.empty());
};

export {
    getFirstBy,
    getFirstIndexBy
};