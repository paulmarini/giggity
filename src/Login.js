import React, { Component } from 'react';
import requests from './requests';
import { Button } from '@material-ui/core';
import {TextField} from 'formik-material-ui';

import { Formik, Form, Field } from 'formik';

const projects = ['BLO', 'InspectorGadje'];

const defaultState = {
  user: 'g',
  password: 'g',
  project: 'blo',
  error: ''
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  login = (values) => {
    this.setState({error: ''})
    console.log(values)
    this.setState({password: ''});
    return requests.login(values)
      .then(() => {
        console.log('login ok')
        this.props.history.push(`/`);
      })
      .catch(errorRes => {
        const error = (errorRes.response.data && errorRes.response.data.error) || errorRes.response.statusText;
        console.log(error);
        this.setState({error})
      });
  };

  renderError = () => {
    if (this.state.error) {
      return <div>Error: {this.state.error}</div>
    }
  }

  render() {
    const {user, project, password} = this.state;
    return (
      <div style={{maxWidth: 300, margin: 'auto'}}>
        <h3>Login</h3>
        {this.renderError()}
        <Formik onSubmit={this.login} initialValues={{user, project, password}} enableReinitialize={true}>
          {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
            <Form>
              <Field
                name="user"
                label="User"
                data-validators="isRequired"
                fullWidth
                component={TextField}
              />
              <Field
                name="password"
                label="Password"
                type="password"
                data-validators="isRequired"
                fullWidth
                component={TextField}
              />
              <Field
                name="project"
                label="Project"
                data-validators="isRequired"
                fullWidth
                component={TextField}
                />
              <Button variant="contained" type="submit" color="primary">
                Login
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default Home;
