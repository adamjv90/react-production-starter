import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { throttle } from 'lodash';
import { didScroll } from './actions';

const Scroll = React.createClass({
  contextTypes: {
    store: PropTypes.object
  },

  componentDidMount() {
    const el = findDOMNode(this);
    this.context.store.dispatch(didScroll({ name: this.props.name, y: el.scrollTop, x: el.scrollLeft, scrollHeight: el.scrollHeight }))

    this.handleWindowResizeThrottled = throttle(this.handleWindowResize, 100);
    window.addEventListener('resize', this.handleWindowResizeThrottled)
  },

  handleWindowResize() {

  },

  render() {
    return (
      <div { ...this.props } onScroll={ (event) => {
          console.log(event);
          this.context.store.dispatch(didScroll({ name: this.props.name, y: event.target.scrollTop, x: event.target.scrollLeft, scrollHeight: event.target.scrollHeight }));
        } }>
        { this.props.children }
      </div>
    );
  }
});

export default Scroll;
