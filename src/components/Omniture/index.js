import React, { Component, PropTypes } from 'react';
import partial from 'lodash/partial';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { pageView } from '../../utils/Omniture';

class Omniture extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    pageView(this.props).then((props) => console.log('omniture page view', props));
  }

  componentDidUpdate() {
    pageView(this.props).then((props) => console.log('omniture page view', props));
  }

  render() {
    return <div />;
  }
}

export default Omniture;
