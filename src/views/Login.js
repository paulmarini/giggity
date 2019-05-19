import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { Link } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { login, emit } from '../socket'
import queryString from 'query-string'

import { Formik, Form, Field } from 'formik';

const defaultState = {
  email: '',
  accessCode: '',
  error: '',
}

class Login extends Component {
  constructor(props) {
    super(props);
    const query = queryString.parse(this.props.location.search)
    this.state = { ...defaultState, ...query };
    if (query.accessCode) {
      this.state.showLogin = true;
    }
  };

  // async componentDidMount() {
  //   const projects = (await emit('find', 'projects')).data;
  //   this.setState({ ...defaultState, projects });
  // }

  login = (values, formikBag) => {
    this.setState({ error: '' })
    this.setState({ accessCode: '' });
    login({
      email: values.email,
      password: values.accessCode,
      project: values.project
    })
      .then(({ accessToken }) => {
        document.cookie = `feathers-jwt=${accessToken}; path=/`;
        // this.setState({ authed: true })
        window.location = `/auth/auth0`;
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
    const { email, accessCode } = this.state;
    return (
      <div style={{ maxWidth: 300, margin: 'auto' }}>
        <h3>Login</h3>
        {this.renderError()}
        <Formik onSubmit={this.login} initialValues={{ email, accessCode }} enableReinitialize={true}>
          {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
            <Form>
              <Field
                name="email"
                label="Email"
                data-validators="isRequired"
                fullWidth
                component={TextField}
              />
              <Field
                name="accessCode"
                label="Access Code"
                type="accessCode"
                data-validators="isRequired"
                fullWidth
                component={TextField}
              />
              {/* <Field
                name="project"
                label="Project"
                data-validators="isRequired"
                fullWidth
                component={Select}
                >
                {
                  projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)
                }
              </Field> */}
              <Button variant="contained" type="submit" color="primary">
                Login
              </Button>
            </Form>
          )}
        </Formik>
      </div >
    );
  }
}

export default Login;
