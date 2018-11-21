const mapIf = (predicate, mapper) => (element, i, array) => {
    if (predicate(element, i, array))
        return mapper(element, i, array);
    return element;
};

export {mapIf};