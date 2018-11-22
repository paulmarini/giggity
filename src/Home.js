import React from 'react';
import {Link, Switch, Route} from 'react-router-dom';
import Gig from './Gig';
import GigList from './GigList';
import requests from './requests';
// import Drawer from '@material-ui/core/Drawer';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import List from '@material-ui/core/List';
// import Typography from '@material-ui/core/Typography';
import {AppBar, Toolbar, Typography} from '@material-ui/core'

import './Home.css';
const drawerWidth = 200;

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
      socket: null
    };
  };
  componentDidMount () {
    const socket = requests.init();
    console.log('%%%', socket);
    this.setState({socket})
  };
  render() {
    if (!this.state.socket) {
      return "...";
    }
    return (
      <div style={{display: 'flex'}}>
        <AppBar position="fixed" style={{width: `calc(100% - ${drawerWidth}px)`}}>
          <Toolbar>
            <Typography variant="h4" color="inherit" noWrap>
             Giggity!
            </Typography>
          </Toolbar>
        </AppBar>
        <nav style={{width: drawerWidth}}>
          <GigList width={drawerWidth}></GigList>
        </nav>
        <main className="Home" style={{flex: '1 1 100%', padding: 20, paddingTop: 80}}>
          <Switch>
            <Route exact path='/gigs/new' component={Gig}/>
            <Route path='/gigs/:id' component={Gig}/>
            <Route exact path=''>
              <div>
                <h2>Welcome</h2>
                <Link to='/gigs/new'>New Gig</Link>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    );
  }
}

export default Home;
