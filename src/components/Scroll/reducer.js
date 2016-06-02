import * as types from '../../constants';
import update from 'react/lib/update';

export default function scroll(state = {}, action) {
  switch (action.type) {
    case types.SCROLL:
      return update(state, {
        [action.name] : {
          $set: {
            x: action.x,
            y: action.y,
            scrollHeight: action.scrollHeight
          }
        }
      });
    default:
      return state;
  }
}
