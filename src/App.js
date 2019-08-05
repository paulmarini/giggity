import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './views/Home';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import themeConfig from './util/themeConfig';
import './App.css';

const theme = createMuiTheme(themeConfig);

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
export { themeConfig };
