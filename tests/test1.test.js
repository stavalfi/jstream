import test from 'ava';
import prettyjson from 'prettyjson';

import parser from '../src/v2/parser';
import workflows from './workflows';

console.log(prettyjson.render(parser(workflows)));

/* eslint fp/no-nil:0 */
/* eslint fp/no-mutation:0 fp/no-let:0 */

test('1) test!!!', () => {

});