export function kindof(obj) {
    if (obj === undefined) return 'undefined';
    if (obj === null) return 'null';

    switch (typeof obj) {
        case 'object':
            switch (Object.prototype.toString.call(obj)) {
                case '[object RegExp]':
                    return 'regexp';
                case '[object Date]':
                    return 'date';
                case '[object Array]':
                    return 'array';
                case '[object Map]':
                    return 'map';
                default:
                    return typeof obj;
            }

        default:
            return typeof obj;
    }
}