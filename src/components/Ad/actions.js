import {
  AD_LOADED
} from '../../constants';

export function adLoaded({ id, height, width }) {
  return {
    type: AD_LOADED,
    id, width, height
  };
}
