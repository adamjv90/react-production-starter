import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

// if (canUseDOM) require('./style.scss');

class Modal extends Component {

  render() {
    const dimensions = this.calculateSize();
    return (
      <div className={ classNames(
        'app--modal',
        'show',
        this.props.className
      ) }>
        <Link component='div' className='overlay' to={ this.props.returnTo } />
        <div className='container'>
          <div className='wrap'>
            <div className='parent' ref='modal'>
              <div className='modal' style={ { height: dimensions.height, width: dimensions.width } }>
                { this.props.children }
              </div>
              <Link component='div' className='close' to={ this.props.returnTo } />
            </div>
          </div>
        </div>
      </div>
    );
  }

  calculateSize() {
    if (!canUseDOM) {
      return {
        width: 0,
        height: 0
      };
    }

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let modalWidth = 1400;
    let modalHeight = 900;

    while (modalWidth > windowWidth - 40) modalWidth -= 100;
    while (modalHeight > windowHeight - 40) modalHeight -= 100;

    return {
      width: this.props.width ? this.props.width : modalWidth,
      height: this.props.height ? this.props.height : modalHeight
    };
  }

}

Modal.PropTypes = {
  maxHeight: PropTypes.number,
  maxWidth: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  margin: PropTypes.number
};

Modal.deafultProps = {
  maxWidth: 1400,
  maxHeight: 900,
  width: false,
  height: false,
  margin: 50
};

export default Modal;
