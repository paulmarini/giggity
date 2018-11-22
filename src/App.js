import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import Home from './Home';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';

const App = () => (
  <React.Fragment>
    <CssBaseline />
    <Switch>
      <Route path="/" component={Home} />
      </Switch>
  </React.Fragment>
);

export default App;
