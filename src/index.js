import { createElement as e } from 'react'
import { render } from 'react-dom'

import { compose, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'

import PouchDB from 'pouchdb'

import reduceState, { setSampleState, collections } from './state'
import persistStore from './persistence'
import App from './App'

installDevTools(Immutable)
PouchDB.debug.enable('pouchdb:api')

const db = new PouchDB('goal-factorizer')

const store = createStore(
  reduceState,
  compose(
    persistStore(db, collections),
    applyMiddleware(thunk),
    applyMiddleware(createLogger())
  )
)

window.store = store

setSampleState(() => {})

render(
  e(Provider, {store}, e(App)),
  document.getElementById('root')
)
