import React, { Component, Children, PropTypes, cloneElement } from 'react';
import { css } from 'aphrodite';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import Helmet from 'react-helmet';
import Modal from '../Modal';
import stylesheet from './stylesheet';

class App extends Component {
  componentWillReceiveProps() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousChildren
    );
    if (!isModal) {
      this.previousChildren = this.props.children;
    }
  }

  render() {
    const { location } = this.props;
    const isModal = (
      location.state &&
      location.state.modal &&
      this.previousChildren
    );

    return (
      <div className={ css(stylesheet.app) }>
          <Helmet
            title="Style Me Pretty"
          />

          { isModal ? this.previousChildren : this.props.children }
          { isModal && (
            <Modal returnTo={ location.state.returnTo } location={ location }>
              { this.props.children }
            </Modal>
          ) }
      </div>
    );
  }
}

export default App;
