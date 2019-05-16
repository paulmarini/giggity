import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import SideBar from '../views/sidebar/SideBar';
import Login from './Login';
import Welcome from './Welcome';
import Errors from '../components/Errors';
import SignUp from './SignUp';
import Settings from './/settings';
import Gig from './gig';
import { connect } from 'react-redux';
import { actions } from '../store';
import { logout, authenticate, socket, emit } from '../socket';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import NavBar from './NavBar';
import './Home.scss';
let drawerWidth = 300;

const styles = theme => (console.log(theme) || {
  appBar: {
    zIndex: theme.zIndex.modal - 1,
  },
  toolbar: theme.mixins.toolbar,
  home: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    flex: '1 1 100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth
    }
  },
  paper: {
    color: '#000'
  }
});

const defaultState = {
  initialized: false
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.public_routes = ['/', '/login', '/signup'];
  }

  componentDidMount() {
    authenticate()
      .finally(() => {
        this.setState({ initialized: true })
      })
  }

  componentDidUpdate() {
    this.checkAuth()
  }

  checkAuth() {
    if (this.state.initialized && !this.props.authenticated && !this.public_routes.includes(this.props.location.pathname)) {
      this.props.history.push(`/login`);
      logout();
    } else {
      const path = localStorage.getItem('authExpiredPath');
      if (path) {
        const [method, service, args] = JSON.parse(localStorage.getItem('authExpiredMethod') || []);
        localStorage.removeItem('authExpiredPath');
        localStorage.removeItem('authExpiredMethod');
        window.location.location = path;
        if (method) {
          console.log('re-sending after re-auth', method, service, args);
          emit(method, service, ...args);
        }
      }
    }
  }

  render() {
    const { classes, authenticated, location, width, users, errors, removeError } = this.props;
    if (!this.state.initialized) {
      return "...";
    }
    if (!authenticated && !this.public_routes.includes(this.props.location.pathname)) {
      return <Redirect to="/" />
    }
    const showSidebar = authenticated && (location.pathname === '/' || location.pathname.match(/^\/(gigs|settings|rehearsals)/));
    return (
      <div className='Home' style={{ display: 'flex' }}>
        <NavBar />
        <SideBar {...{ authenticated, location, width, drawerWidth, showSidebar, history: this.props.history }} />
        <main
          className={classes.home}
          style={{
            marginLeft: showSidebar && width !== 'xs' ? drawerWidth : 0
          }}>
          <div className={classes.toolbar} />
          <Errors errors={errors} removeError={removeError} />
          <div className='content'>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={SignUp} />
              {/* <Route exact path='/gigs/new' component={Gig} /> */}
              <Route path='/gigs/:id?' component={Gig} />
              <Route path='/rehearsals/:id?' component={Gig} />
              <Route path='/settings' component={Settings} />
              <Route exact path='/'>
                {
                  authenticated ? <Redirect to="/gigs" /> : <Welcome />
                }
              </Route>
            </Switch>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  errors: state.errors,
  authenticated: state.authenticated,
  users: state.users,
});

const mapDispatchToProps = {
  removeError: actions.removeError
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withWidth()(Home)));
