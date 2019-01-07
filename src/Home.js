import React from 'react';
import {Link, Switch, Route} from 'react-router-dom';
import Gig from './Gig';
import User from './User';
import GigList from './GigList';
import requests from './requests';
import Login from './Login';
import updateUser from './user';
import { connect } from 'react-redux';
import { actions } from './store';

// import Drawer from '@material-ui/core/Drawer';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import List from '@material-ui/core/List';
// import Typography from '@material-ui/core/Typography';
import {AppBar, Toolbar, Typography} from '@material-ui/core'

import './Home.css';
let drawerWidth = 0;

// const styles = theme => ({
//   root: {
//     display: 'flex',
//   },
//   appBar: {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//   },
//   drawer: {
//     width: drawerWidth,
//     flexShrink: 0,
//   },
//   drawerPaper: {
//     width: drawerWidth,
//   },
//   toolbar: theme.mixins.toolbar,
//   content: {
//     flexGrow: 1,
//     backgroundColor: theme.palette.background.default,
//     padding: theme.spacing.unit * 3,
//   },
// });


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      drawerWidth: 0
    };
    const user = updateUser();

    this.props.setUser(user);
  };
  componentDidMount () {
    if (! requests.authToken) {
      this.logout();
    } else {
      this.init();
    }
  };

  componentDidUpdate (prevProps) {
    console.log(requests.authToken, prevProps.location.pathname)
    if (! requests.authToken && this.props.location.pathname !== '/login') {
      this.logout();
    } else {
      this.init();
    }
  }

  init () {
    console.log(this.state.socket, requests.authToken)
    if (requests.authToken) {
      const newState = {};
      console.log(this.state)
      if (! this.state.drawerWidth) {
        newState.drawerWidth = 200;
      }
      if(!this.state.socket) {
        const socket = requests.init();
        console.log('%%%', socket);
        newState.socket = socket;
        // this.setState({socket})
      }
      console.log('!!!', newState);
      if (Object.keys(newState).length) {
        this.setState(newState)
      }
    }
  }

  logout () {
    console.log('logout!');
    drawerWidth = 0;
    requests.logout();
    this.props.history.push(`/login`);
    this.setState({drawerWidth: 0, socket: null});
  }

  render() {
    console.log('@@@', this.props)
    const {drawerWidth} = this.state;
    if (!this.state.socket && requests.authToken) {
      return "...";
    }
    return (
      <div style={{display: 'flex'}}>
        <AppBar position="fixed" style={{width: `calc(100% - ${drawerWidth}px)`}}>
          <Toolbar>
            <Typography variant="h4" color="inherit" noWrap>
             <Link to='/'>Giggity!</Link>
            </Typography>
            <Link to='/' onClick={() => this.logout()}>Logout</Link>
          </Toolbar>
        </AppBar>
        <nav style={{width: drawerWidth}}>
          {
            requests.authToken ? <GigList width={drawerWidth} currentLocation={this.props.location.pathname}></GigList> : ''
          }
        </nav>
        <main className="Home" style={{flex: '1 1 100%', padding: 20, paddingTop: 80}}>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path='/gigs/new' component={Gig}/>
            <Route exact path='/users/new' component={User}/>
            <Route path='/gigs/:id' component={Gig}/>
            <Route path='/users/:id' component={User}/>
            <Route exact path=''>
              <div>
                <h2>Welcome</h2>
                <Link to='/gigs/new'>New Gig</Link>
                <Link to='/users/new'>New User</Link>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    );
  }
}

export default connect(
  null,
  {setUser: actions.setUser}
)(Home);
