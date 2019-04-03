import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { login } from './socket'

import { Formik, Form, Field } from 'formik';

const projects = ['BLO', 'InspectorGadje'];

const defaultState = {
  user: 'g',
  password: 'a',
  project: 'blo',
  error: ''
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  login = (values, formikBag) => {
    this.setState({ error: '' })
    this.setState({ password: '' });
    login({
      email: values.user,
      password: values.password,
    })
      .then(() => {
        this.props.history.push(`/`);
      })
      .catch(error => {
        this.setState({ error: error.message })
      })
      .finally(() => {
        formikBag.setSubmitting(false);
      })
  };

  renderError = () => {
    if (this.state.error) {
      return <div>Error: {this.state.error}</div>
    }
  }

  render() {
    const { user, project, password } = this.state;
    return (
      <div style={{ maxWidth: 300, margin: 'auto' }}>
        <h3>Login</h3>
        {this.renderError()}
        <Formik onSubmit={this.login} initialValues={{ user, project, password }} enableReinitialize={true}>
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
