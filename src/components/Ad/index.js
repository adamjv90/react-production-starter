import React, { PropTypes, Component } from 'react';
import EventEmitter from 'eventemitter3';
import uniqueId from 'lodash/uniqueId';
import isUndefined from 'lodash/isUndefined';
import delay from 'lodash/delay';
import { adLoaded } from './actions';

const AdEvents = new EventEmitter({
  maxListeners: 20
});

class Ad extends Component {

  constructor(props) {
    super(props);

    this.onLoad = this._onLoad.bind(this);

    this.state = {
      id: props.name ? props.name : uniqueId() + '-' + props.mn
    };
  }

  componentDidMount() {
    AdEvents.on('load', this.onLoad);
    this.load();
  }

  componentWillUnmount() {
    if(AdEvents.listeners('load').length) {
      AdEvents.removeListener('load', this.onLoad);
    }
  }

  componentDidUpdate() {
    this.load();
  }

  load() {
    this.loadExternalScripts(() => {
      const existing = document.getElementById(this.state.id);

      if (existing) {
        existing.innerHTML = '';
      }

      window.htmlAdWH(this.props.mn, this.props.width, this.props.height, 'ajax', this.state.id);
    });
  }

  loadExternalScripts(cb) {
    if (isUndefined(window.htmlAdWH)) {
      return delay(this.loadExternalScripts.bind(this), 50, cb);
    }

    if (isUndefined(window.adsDevilAd.resized)) {
      window.adsDevilAd.resized  = (name, width, height) => {
        AdEvents.emit('load', { name, width, height });
      };
    }

    cb();
  }

  _onLoad({ name, width, height }) {
    this.context.store.dispatch(adLoaded({
      id: this.state.id,
      width: parseInt(width),
      height: parseInt(height)
    }));
  }

  render() {
    return <div id={ this.state.id } />;
  }

}

Ad.contextTypes = {
  store: PropTypes.object
};


export default Ad;
