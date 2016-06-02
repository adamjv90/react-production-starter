import { provideHooks } from 'redial';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadPosts } from './actions';
import { StyleSheet, css } from 'aphrodite';
import { Type } from '../../style';
import { get } from 'lodash';
import Helmet from 'react-helmet';
import NotFound from '../../components/NotFound';
import Ad from '../../components/Ad';
import Scroll from '../../components/Scroll';

const redial = {
  fetch: ({ dispatch }) => dispatch(loadPosts()),
};

const mapStateToProps = state => ({
  scrollY: get(state, 'scroll.app.y', 0),
  width: state.browser.mediaType === 'infinity' ? 1140 : '100%',
  isLoading: state.wpQuery.isLoading,
  error: state.wpQuery.error
});

const BlogPage = React.createClass({
  getInitialState() {
      return {
        adVisible: true,
        adHeight: 108
      };
  },

  componentWillReceiveProps(nextProps) {
    const toggleScrollAmount = 800;
    const {adVisible, adHeight} = this.state;
    if (nextProps.scrollY >= toggleScrollAmount && adVisible) {
      this.setState({ adVisible: false });
    } else if (nextProps.scrollY <= toggleScrollAmount - adHeight) {
      this.setState({ adVisible: true });
    }
  },

  render() {
    const {title, content, isLoading, error, width} = this.props;
    const {adVisible, adHeight} = this.state;
    if (!error) {
      return (
        <div className={css(styles.container)}>
          <Helmet
            title={ title }
          />
          {isLoading &&
            <div>
              loading ...
            </div>
          }
          {!isLoading &&
            <div className={css(styles.wrapper)}>
              <div className={css(styles.banner)} style={{height: adVisible ? adHeight : 0}}>
                <Ad mn="93374928" width="LB" height="LB" />
              </div>
              <div className={css(styles.header)}>
                <div style={{width, color: '#fff'}}>
                  Header
                </div>
              </div>
              <div className={css(styles.body)}>
                <Scroll name='app' className={css(styles.scroll)}>
                  <div className={css(styles.content)}>
                    <div style={{width: 200, height: 330, backgroundColor: 'red'}} />
                    <div style={{width: 200, height: 350, backgroundColor: 'blue'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'purple'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'pink'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'red'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'blue'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'purple'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'pink'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'red'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'blue'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'purple'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'pink'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'red'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'blue'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'purple'}} />
                    <div style={{width: 200, height: 200, backgroundColor: 'pink'}} />
                  </div>
                </Scroll>
              </div>
            </div>
          }
        </div>
      );
    } else {
      // maybe check for different types of errors and display appropriately
      return <NotFound />;
    }
  }
});

BlogPage.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%'
  },
  wrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  banner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
    transition: 'height .5s ease'
  },
  header: {
    backgroundColor: '#ACACAC',
    display: 'flex',
    height: 50,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
    // overflow: 'hidden',
    // overflowY: 'auto'
  },
  scroll: {
    flex: 1,
    overflow: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

export default provideHooks(redial)(connect(mapStateToProps)(BlogPage));
