import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Gig from './Gig';
import User from './User';
import Users from './Users';
import GigList from './GigList';
import Login from './Login';
import Welcome from './Welcome';
import Errors from './Errors';
import SignUp from './SignUp';
import { connect } from 'react-redux';
import { actions } from '../store';
import { logout, authenticate } from '../socket';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuIcon from '@material-ui/icons/Menu';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import Link from './Link'

// import Drawer from '@material-ui/core/Drawer';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import List from '@material-ui/core/List';
// import Typography from '@material-ui/core/Typography';
import { AppBar, Toolbar, Typography } from '@material-ui/core'

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

  handleDrawerToggle = () => {
    this.props.updateDrawer(!this.props.drawerOpen);
  }

  renderNav() {
    const { classes } = this.props;
    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Hidden smUp>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Typography variant="h4" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link color="inherit" to='/'>
              Giggity
            </Link>
          </Typography>
          {this.props.authenticated &&
            <Link color="inherit" to='/members'>
              Members
            </Link>
          }
          {
            this.props.authenticated &&
            <Link color="inherit" to='/' onClick={() => logout()}>
              Logout
              <IconButton
                color="inherit"
                onClick={this.handleDrawerToggle}
              >
                <LogoutIcon />
              </IconButton>
            </Link>
          }
        </Toolbar>
      </AppBar >
    )
  }

  render() {
    const { classes, authenticated, location, width, users, errors, removeError } = this.props;
    if (!this.state.initialized) {
      return "...";
    }
    const showSidebar = authenticated && (location.pathname === '/' || location.pathname.match("/gigs/"));
    return (
      <div style={{ display: 'flex' }}>
        {this.renderNav()}
        <nav>
          {
            showSidebar ?
              <GigList
                width={width}
                currentLocation={location.pathname}
                drawerWidth={drawerWidth}
              /> :
              ''
          }
        </nav>
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
            <Route exact path='/members'>
              <Users users={users} />
            </Route>
            <Route exact path='/members/new' component={User} />
            <Route path='/gigs/:id' component={Gig} />
            <Route path='/members/:id' component={User} />
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

export default connect(
  state => ({
    errors: state.errors,
    authenticated: state.authenticated,
    users: state.users,
    drawerOpen: state.drawerOpen
  }),
  {
    loadUsers: actions.loadUsers,
    removeError: actions.removeError,
    updateDrawer: actions.updateDrawer
  }
)(withStyles(styles)(withWidth()(Home)));
