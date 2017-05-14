import { createElement as e } from 'react'
import { connect } from 'react-redux'
import { Set } from 'immutable'
import { getNodesByType, addNode, removeNode, updateNode } from './state'

const AddNode = connect(null, {addNode})(
  ({addNode, type}) => e(
    'button',
    {onClick: () => addNode({type, text: type}), style: {marginTop: '1em'}},
    'Add ' + type
  )
)

const strToParents = s => Set(s.split(/\s+/))

const Node = connect(
  null,
  (dispatch, {nodeId}) => ({
    removeNode: () => dispatch(removeNode({nodeId})),
    updateNode: (node) => dispatch(updateNode({nodeId, node}))
  })
)(
  ({nodeId, node, removeNode, updateNode}) => e('div', {style: {marginTop: '1em'}},
    nodeId,
    ' ',
    e('input', {
      onChange: e => updateNode({parents: strToParents(e.target.value)}),
      value: node.parents.toArray().join(' '),
      size: 3
    }),
    ' ',
    e('input', {
      onChange: e => updateNode({text: e.target.value}),
      value: node.text
    }),
    ' ',
    e('button', {onClick: removeNode}, 'del')
  )
)

const NodeList = ({type, nodes}) =>
  e('div', {style: {marginRight: '5em', padding: '0.5em'}},
    e('h2', {}, type || '(No type)'),
    nodes.entrySeq().map(
      ([nodeId, node]) => e(Node, {key: nodeId, nodeId, node})
    ),
    e(AddNode, {type})
  )

export default connect(
  state => ({
    nodesByType: getNodesByType(state)
  })
)(
  ({nodesByType}) => e('div', {style: {display: 'flex'}},
    nodesByType.map(
      ([type, nodes]) => e(NodeList, {key: type, type, nodes})
    )
  )
)
