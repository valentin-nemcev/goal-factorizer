import { createElement as e } from 'react'
import { connect } from 'react-redux'
import { withCanvas, Endpoint, Edge } from './plumb'

import {
  nodesByType,
  edges,
  addNode,
  removeNode,
  updateNode,
  toggleNodeParentsEditing,
  toggleParent,
  nodeInParentEditMode,
  nodeInParentEditModeisParent
} from './state'

const AddNode = connect(null, {addNode})(
  ({addNode, type}) => e(
    'button',
    {onClick: () => addNode({type, text: type}), style: {marginTop: '1em'}},
    'Add ' + type
  )
)

const ParentEditModeCheckbox = connect(
  (state, {node, nodeId}) => ({
    parentEdit: nodeInParentEditMode(state) === nodeId
  }),
  (dispatch, {nodeId}) => ({
    toggleParentEdit:
      (toggle) => dispatch(toggleNodeParentsEditing({nodeId, toggle}))
  })
)(({parentEdit, toggleParentEdit}) =>
  e('input', {
    type: 'checkbox',
    onChange: e => toggleParentEdit(e.target.checked),
    checked: parentEdit
  })
)

const ParentCheckbox = connect(
  (state, {node, nodeId}) => ({
    someNodeInParentEditMode: nodeInParentEditMode(state) != null,
    thisNodeIsParent: nodeInParentEditModeisParent(state, node),
    parentNodeId: nodeInParentEditMode(state)
  }),
  (dispatch, {nodeId}) => ({
    toggleParent: (toggle, parentNodeId) => dispatch(toggleParent({
      childNodeId: nodeId,
      parentNodeId,
      toggle
    }))
  })
)(({someNodeInParentEditMode, thisNodeIsParent, parentNodeId, toggleParent}) =>
    e('input', {
      style: {visibility: someNodeInParentEditMode ? 'visible' : 'hidden'},
      type: 'checkbox',
      checked: thisNodeIsParent,
      onChange: e => toggleParent(e.target.checked, parentNodeId)
    })
)

const Node = connect(
  null,
  (dispatch, {nodeId}) => ({
    removeNode: () => dispatch(removeNode({nodeId})),
    updateNode: (node) => dispatch(updateNode({nodeId, node}))
  })
)(
  ({nodeId, node, removeNode, updateNode, canvas}) => e(
    Endpoint,
    {style: {marginTop: '1em', padding: '0 0.5em'}, canvas, endpoint: nodeId},
    e(ParentCheckbox, {node, nodeId}),
    ' ',
    e('input', {
      onChange: e => updateNode({text: e.target.value}),
      value: node.text
    }),
    ' ',
    e('button', {onClick: removeNode}, 'del'),
    e(ParentEditModeCheckbox, {node, nodeId}),
  )
)

const NodeList = ({type, nodes, canvas}) =>
  e('div', {style: {marginRight: '8em'}},
    e('h2', {}, type || '(No type)'),
    nodes.entrySeq().map(
      ([nodeId, node]) => e(Node, {key: nodeId, nodeId, node, canvas})
    ),
    e(AddNode, {type})
  )

export default connect(
  state => ({
    nodesByType: nodesByType(state),
    edges: edges(state)
  })
)(
  withCanvas(
    ({nodesByType, edges, canvas}) => e('div', {style: {display: 'flex'}},
      nodesByType.map(
        ([type, nodes]) => e(NodeList, {key: type, type, nodes, canvas})
      ),
      edges.map(
        ({source, target}) => e(Edge, {
          source,
          target,
          key: [source, target].join(':'),
          connection: {
            anchors: ['Right', 'Left'],
            connector: ['Bezier', {curviness: 50}],
            endpoint: ['Rectangle', {width: 2, height: 10}]
          },
          canvas
        })
      )
    )
  )
)
