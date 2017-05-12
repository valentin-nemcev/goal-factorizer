import { createElement as e } from 'react'
import { render } from 'react-dom'

render(
  e('div', {}, 'Hey!'),
  document.getElementById('root')
)
