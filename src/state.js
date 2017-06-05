import { createAction, createReducer } from 'redux-act'
import { combineReducers } from 'redux-immutable'
import { Map, List, OrderedMap, Record, Set } from 'immutable'

const Node = Record({text: 'Node', type: null, parents: Set()})

let lastId = 0

export const addNode = createAction('addNode')
export const removeNode = createAction('removeNode')
export const updateNode = createAction('updateNode')

export const toggleNodeParentsEditing =
  createAction('toggleNodeParentsEditing')

export const toggleParent = createAction('toggleParent')

export const reduceState = combineReducers({
  nodes: createReducer({
    [addNode]: (nodes, node) => nodes.set(String(lastId++), new Node(node)),
    [removeNode]: (nodes, {nodeId}) => nodes.delete(nodeId),
    [updateNode]: (nodes, {nodeId, node}) => nodes.mergeIn([nodeId], node),
    [toggleParent]: (nodes, {childNodeId, parentNodeId, toggle}) =>
      nodes.updateIn(
        [childNodeId, 'parents'],
        parents => parents[toggle ? 'add' : 'delete'](parentNodeId)
      )
  }, OrderedMap({
  })),
  local: combineReducers({
    nodeInParentEditMode: createReducer({
      [toggleNodeParentsEditing]:
        (prevNodeId, {nodeId, toggle}) => toggle ? nodeId : null
    }, null)
  }, Map)
}, Map)

export const nodesByType = (state) =>
  List(['action', 'goal']).map(
    t => [t, state.get('nodes').filter(n => n.type === t)]
  )

export const edges = (state) =>
  state.get('nodes').entrySeq().flatMap(
    ([childId, child]) => child.parents.map(
      parentId => ({source: parentId, target: childId})
    )
  )

export const nodeInParentEditMode =
  (state) => state.getIn(['local', 'nodeInParentEditMode'])

export const nodeInParentEditModeisParent = (state, node) => {
  return node.parents.has(nodeInParentEditMode(state))
}

export const setSampleState = (dispatch) => {
  console.log(dispatch(addNode({text: 'Goal 1', type: 'goal', parents: Set(['2', '4'])})))
  dispatch(addNode({text: 'Goal 2', type: 'goal', parents: Set(['2'])}))
  dispatch(addNode({text: 'Action 1', type: 'action'}))
  dispatch(addNode({text: 'Action 2', type: 'action'}))
  dispatch(addNode({text: 'Action 3', type: 'action'}))
}
