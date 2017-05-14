import { createElement as e } from 'react'
import { connect } from 'react-redux'
import { addGoal, removeGoal, updateGoal } from './actions'

const AddGoal = connect(null, {addGoal})(
  ({addGoal}) => e('button', {onClick: addGoal}, 'Add goal')
)

const Goal = connect(
  null,
  (dispatch, {goalId}) => ({
    removeGoal: () => dispatch(removeGoal({goalId})),
    updateGoal: (goal) => dispatch(updateGoal({goalId, goal}))
  })
)(
  ({goal, removeGoal, updateGoal}) => e('div', {},
    ' ',
    e('input', {
      onChange: e => updateGoal({text: e.target.value}),
      value: goal.text
    }),
    ' ',
    e('button', {onClick: removeGoal}, 'del')
  )
)

const GoalList = connect(state => ({goals: state.get('goals')}))(({goals}) =>
  e('div', null,
    goals.entrySeq().map(
      (goal, goalId) => e(Goal, {key: goalId, goalId, goal})
    ),
    e(AddGoal)
  )
)

export default () => e('div', null,
  e('h2', {}, 'Goals'),
  e(GoalList)
)
