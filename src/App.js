import { createElement as e } from 'react'

import AceEditor from 'react-ace'

import 'brace'
import 'brace/ext/searchbox'
import 'brace/mode/json'
import 'brace/theme/github'

export default () => e(AceEditor, {
  mode: 'json',
  theme: 'github',
  editorProps: {$blockScrolling: true}
})
