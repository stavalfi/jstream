console.clear()

var source = ['1', '1', 'foo', '2', '3', '5', 'bar', '8', '13']

var result = 0
for (var i = 0; i < source.length; i++) {
  var parsed = parseInt(source[i])
  if (!isNaN(parsed)) {
    result += parsed
  }
}

console.log(result) // should print the number `33` only

import { from } from 'rxjs'
import { filter, map, reduce } from 'rxjs/operators'

from(source)
  .pipe(
    filter(x => !isNaN(Number(x))),
    map(Number),
    reduce((acc, x) => acc + x, 0),
  )
  .subscribe(console.log.bind(console))
