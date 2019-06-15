const { codeFrameColumns } = require('@babel/code-frame')

const rawLines =
  "import 'fonts/my-symphony.font.js'\n" +
  '\n' +
  "import React from 'react'\n" +
  "import ReactDOM from 'react-dom'\n" +
  "import App from 'app'\n" +
  '\n' +
  '// @ts-ignore\n' +
  "ReactDOM.render(<App />, document.getElementById('app'))\n"
const location = { start: { line: 14, column: 7 } }

const result = codeFrameColumns(rawLines, location, {
  /* options */
})

console.log(result)
