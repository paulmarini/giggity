import React, { Component } from 'react';
import { Button, MenuItem } from '@material-ui/core';
import { TextField, Select } from 'formik-material-ui';
import { login, emit } from '../socket'

import { Formik, Form, Field } from 'formik';

const defaultState = {
  user: localStorage.getItem('email') || 'admin@test.com',
  password: '',
  project: localStorage.getItem('project') || 'blo',
  error: '',
  projects: []
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  async componentDidMount() {
    const projects = (await emit('find', 'projects')).data;
    this.setState({ ...defaultState, projects });
  }

  login = (values, formikBag) => {
    this.setState({ error: '' })
    this.setState({ password: '' });
    login({
      email: values.user,
      password: values.password,
      project: values.project
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
    const { user, project, password, projects } = this.state;
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
                component={Select}
              >
                {
                  projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)
                }
              </Field>
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

export default Login;
