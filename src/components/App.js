import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Home from './Home';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/lightBlue';
import pink from '@material-ui/core/colors/pink';

import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: { main: blue[900] }, // Purple and green play nicely together.
    secondary: { main: pink[700] }, // This is just green.A700 as hex.
    action: {
      // selected: blue[300]
    }
  },
  typography: { useNextVariants: true },
});

const App = () => (
  <React.Fragment>
    <CssBaseline />
    <MuiThemeProvider theme={theme}>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </MuiThemeProvider>
  </React.Fragment>
);

export default App;
