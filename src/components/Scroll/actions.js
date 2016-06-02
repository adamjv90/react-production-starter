import {
  SCROLL
} from '../../constants';

export function didScroll({ x, y, name, scrollHeight }) {
  return {
    type: SCROLL,
    x, y, name, scrollHeight
  };
}
