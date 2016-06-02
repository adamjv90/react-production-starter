import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Scroll from './';

function setup() {
  let props = {

  };

  let renderer = TestUtils.createRenderer()
  renderer.render(<Scroll {...props} />)
  let output = renderer.getRenderOutput()

  return {
    props,
    output,
    renderer
  }
}

describe('components', () => {
  describe('Scroll', () => {
    it('should render correctly', () => {
      const { output } = setup();

      expect(output.type).toBe('div');
    });
  });
});
