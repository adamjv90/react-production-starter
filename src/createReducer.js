import { combineReducers } from 'redux';
import { createResponsiveStateReducer } from 'redux-responsive'
import wpQuery from './routes/Blog/reducer';
import scroll from './components/Scroll/reducer';
import ad from './components/Ad/reducer';

// Only combine reducers needed for initial render, others will be
// added async
export default function createReducer(asyncReducers) {
  return combineReducers({
    browser: createResponsiveStateReducer({
      mobile: 640,
      tablet: 1140
    }),
    scroll,
    ad,
    wpQuery,
    ...asyncReducers,
  });
}
