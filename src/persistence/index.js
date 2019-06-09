import uuid from 'uuid-v4'

import { debounce, zip, zipWith } from 'lodash'
import { Set, Seq } from 'immutable'

import { createReducer, createAction } from 'redux-act'
import reduceReducers from 'reduce-reducers'

import diffCollection from './diffCollection'

const newDocMeta = (colKey, key) =>
  ({_id: colKey + '-' + (key || uuid())})

const existingDocMeta = (persitanceState, prevValue) => {
  const {id, rev} = persitanceState.get(prevValue)
  return {_id: id, _rev: rev}
}

const diffToBulk = (persitanceState, colKey, {removed, updated = [], added}) => [
  ...removed.map(({key, prevValue}) => ({
    key,
    prevValue,
    doc: {
      ...existingDocMeta(persitanceState, prevValue),
      _deleted: true
    }
  })),
  ...updated.map(({key, prevValue, currentValue}) => ({
    key,
    prevValue,
    currentValue,
    doc: {
      ...currentValue.toJS(),
      ...existingDocMeta(persitanceState, prevValue)
    }
  })),
  ...added.map(({key, currentValue}) => ({
    key,
    currentValue,
    doc: {
      ...currentValue.toJS(),
      ...newDocMeta(colKey, key)
    }
  }))
]

const persist = async (db, persitanceState, collections, prevState, currentState) => {
  const collectionKeys = Object.keys(collections)
  const bulk = zip(
    collectionKeys,
    ...[prevState, currentState].map(s => collectionKeys.map(c => s.get(c)))
  ).reduce(
    (docs, [key, prevCol, currentCol]) => docs.concat(
      diffToBulk(persitanceState, key, diffCollection(prevCol, currentCol))
    ),
    []
  ).filter(
    docObj => !persitanceState.has(docObj.currentValue)
  )

  if (bulk.length === 0) return []

  const results = await db.bulkDocs(bulk.map(b => b.doc))
  const bulkWithResults = zipWith(bulk, results, (b, state) => ({...b, state}))

  bulkWithResults.forEach(
    ({prevValue, currentValue, state}) => {
      if (prevValue) persitanceState.delete(prevValue)
      if (currentValue) persitanceState.set(currentValue, state)
    }
  )

  return bulkWithResults
}

const extractDoc = row => {
  const {_id, _rev, ...restDoc} = row.doc
  const [collection, ...idParts] = _id.split('-')
  const id = idParts.join('-')
  const doc = Seq(restDoc).filter((v, k) => k[0] !== '_').toObject()
  const state = {id: _id, ok: true, rev: _rev}
  return {id, collection, doc, state}
}

const loadCollections = createAction('loadCollections')

const loadCollectionsReducer = createReducer({
  [loadCollections]: (state, payload) =>
    Seq(payload).reduce(
      (state, values, colName) => state.update(
        colName,
        (col) => col.clear()
        .merge(Set.isSet(col) ? Seq.Keyed(values).valueSeq() : values)
      ),
      state
    )
})

const fetch = async (db, persitanceState, dispatch, collections) => {
  const result = Seq(collections).map(() => []).toObject();
  (await db.allDocs({include_docs: true})).rows.map(extractDoc).forEach(
    ({id, collection, doc, state}) => {
      const value = collections[collection](doc)
      persitanceState.set(value, state)
      if (result[collection]) result[collection].push([id, value])
    }
  )
  dispatch(loadCollections(result))
  return result
}

export default (db, collections) => createStore => (reducer, ...args) => {
  reducer = reduceReducers(
    loadCollectionsReducer,
    reducer
  )
  const store = createStore(reducer, ...args)

  let prevState = store.getState()
  let persitanceState = new window.Map()

  fetch(db, persitanceState, store.dispatch, collections)
    .then(r => console.log('Fetch', r))

  const persistStore = () => {
    const currentState = store.getState()
    persist(db, persitanceState, collections, prevState, currentState)
      .then(r => console.log('Persist', r))

    prevState = currentState
  }

  store.subscribe(debounce(persistStore, 1000))
  return store
}

export const clearDB = async db =>
  db.bulkDocs((await db.allDocs()).rows.map(v => ({
    _id: v.id,
    _rev: v.value.rev,
    _deleted: true
  })))
