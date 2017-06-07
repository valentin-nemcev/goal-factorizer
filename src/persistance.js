import { debounce } from 'lodash'
import { is } from 'immutable'

const diffSets = (prevSet, currentSet) => ({
  removed: prevSet.subtract(currentSet),
  added: currentSet.subtract(prevSet)
})

const diffMaps = (prevMap, currentMap) => ({
  removed: prevMap.filterNot((_, k) => currentMap.has(k)),
  updated: prevMap.filterNot((v, k) => is(v, currentMap.get(k))),
  added: currentMap.filterNot((_, k) => prevMap.has(k))
})

const persist = (db, prevState, currentState) => {
  const prevEdges = prevState.get('edges')
  const currentEdges = currentState.get('edges')
  console.log(diffSets(prevEdges, currentEdges))

  const prevNodes = prevState.get('nodes')
  const currentNodes = currentState.get('nodes')
  console.log(diffMaps(prevNodes, currentNodes))
}

export default db => createStore => (...args) => {
  const store = createStore(...args)

  let prevState = store.getState()
  const persistStore = () => {
    const currentState = store.getState()
    persist(db, prevState, currentState)
    prevState = currentState
  }

  store.subscribe(debounce(persistStore, 1000))
  return store
}
