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

export default (prevCol, currentCol) => {
  let diff
  if (Set.isSet(currentCol)) diff = diffSets
  else if (Map.isMap(currentCol)) diff = diffMaps
  else throw new Error('Unknown collection type')

  return diff(prevCol, currentCol)
}
