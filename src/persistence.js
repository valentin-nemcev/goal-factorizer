import uuid from 'uuid-v4'

import { debounce, zipWith } from 'lodash'
import { is, Set, Map } from 'immutable'

const diffSets = (prevSet, currentSet) => ({
  removed: prevSet.subtract(currentSet).valueSeq()
    .map(v => ({prevValue: v})),
  added: currentSet.subtract(prevSet).valueSeq()
    .map(v => ({currentValue: v}))
})

const diffMaps = (prevMap, currentMap) => ({
  removed: prevMap.entrySeq()
    .filterNot(([k, v]) => currentMap.has(k))
    .map(([key, v]) => ({key, prevValue: v})),
  updated: prevMap.entrySeq()
    .map(([k, v]) => [k, v, currentMap.get(k)])
    .filterNot(([k, prevV, v]) => v == null || is(v, prevV))
    .map(([key, prevV, v]) => ({key, prevValue: prevV, currentValue: v})),
  added: currentMap.entrySeq()
    .filterNot(([k, v]) => prevMap.has(k))
    .map(([key, v]) => ({key, currentValue: v}))
})

const diffKey = (key, prevState, currentState) => {
  let diff
  const prevCol = prevState.get(key)
  const currentCol = currentState.get(key)
  if (Set.isSet(currentCol)) diff = diffSets
  else if (Map.isMap(currentCol)) diff = diffMaps
  else throw new Error('Unknown collection type')

  return diff(prevCol, currentCol)
}

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

const persist = async (db, persitanceState, prevState, currentState) => {
  const bulk = ['edges', 'nodes'].reduce(
    (docs, key) => docs.concat(
      diffToBulk(persitanceState, key, diffKey(key, prevState, currentState))
    ),
    []
  )

  if (bulk.length === 0) return

  const results = await db.bulkDocs(bulk.map(b => b.doc))
  const bulkWithResults = zipWith(bulk, results, (b, result) => ({...b, result}))

  console.info('Persist', bulkWithResults)

  bulkWithResults.forEach(
    ({prevValue, currentValue, result}) => {
      if (prevValue) persitanceState.delete(prevValue)
      if (currentValue) persitanceState.set(currentValue, result)
    }
  )
}

const clearDB = async db =>
  db.bulkDocs((await db.allDocs()).rows.map(v => ({
    _id: v.id,
    _rev: v.value.rev,
    _deleted: true
  })))

export default db => createStore => (...args) => {
  clearDB(db)
  const store = createStore(...args)

  let prevState = store.getState()
  let persitanceState = new window.Map()

  const persistStore = () => {
    const currentState = store.getState()
    persist(db, persitanceState, prevState, currentState)
    prevState = currentState
  }

  store.subscribe(debounce(persistStore, 1000))
  return store
}
