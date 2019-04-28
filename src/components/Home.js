import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Gig from './Gig';
import User from './User';
import SideBar from '../views/SideBar';
import Login from './Login';
import Welcome from './Welcome';
import Errors from './Errors';
import SignUp from './SignUp';
import ProjectSettings from './ProjectSettings';
import ProjectProfile from '../views/project/ProjectProfile';
import Members from '../views/project/Members';
import { connect } from 'react-redux';
import { actions } from '../store';
import { logout, authenticate } from '../socket';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import NavBar from '../views/NavBar';
import './Home.css';
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
    this.public_routes = ['/', '/login', '/signup']
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
      this.props.history.push(`/`);
      logout();
    }
  }

  render() {
    const { classes, authenticated, location, width, users, errors, removeError } = this.props;
    if (!this.state.initialized) {
      return "...";
    }
    const showSidebar = authenticated && (location.pathname === '/' || location.pathname.match(/^\/(gigs|project)/));
    return (
      <div style={{ display: 'flex' }}>
        <NavBar />
        <SideBar {...{ authenticated, location, width, drawerWidth, showSidebar }} />
        <main
          className={classes.home}
          style={{
            marginLeft: showSidebar && width !== 'xs' ? drawerWidth : 0
          }}>
          <div className={classes.toolbar} />
          <Errors errors={errors} removeError={removeError} />
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path='/gigs/new' component={Gig} />
            <Route exact path='/members/new' component={User} />
            <Route path='/gigs/:id' component={Gig} />
            <Route path="/project/profile" component={ProjectProfile} />
            <Route path="/project/custom_fields" component={ProjectSettings} />
            <Route exact path='/project/members'>
              <Members users={users} />
            </Route>
            <Route path="/project/members/:id" component={User} />
            <Route exact path=''>
              {
                !showSidebar && <Welcome />
              }
            </Route>
          </Switch>
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
