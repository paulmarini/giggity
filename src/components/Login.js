import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { Link } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { login, emit } from '../socket'

import { Formik, Form, Field } from 'formik';

const defaultState = {
  user: '',
  password: '',
  // project: localStorage.getItem('project') || 'blo',
  error: '',
  showLogin: false
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  // async componentDidMount() {
  //   const projects = (await emit('find', 'projects')).data;
  //   this.setState({ ...defaultState, projects });
  // }

  login = (values, formikBag) => {
    this.setState({ error: '' })
    this.setState({ password: '' });
    login({
      email: values.user,
      password: values.password,
      project: values.project
    })
      .then(() => {
        this.setState({ authed: true })
        // this.props.history.push(`/`);
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
    const { user, password, showLogin } = this.state;
    if (!showLogin) {
      return (
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          maxWidth: '700px',
          margin: 'auto',
          height: '400px',
          alignItems: 'center',
        }}>
          <Button size="large" variant="contained" color="primary" href='/auth/auth0'>
            Login with Auth0
          </Button>
          <Button size="large" variant="contained" color="default" onClick={() => this.setState({ showLogin: true })}>
            Login with Access Code
          </Button>
        </div>
      )
    }
    return (
      <div style={{ maxWidth: 300, margin: 'auto' }}>
        <h3>Login</h3>
        {this.renderError()}
        <Formik onSubmit={this.login} initialValues={{ user, password }} enableReinitialize={true}>
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
                label="Access Code"
                type="password"
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
              <Button color="default" onClick={() => this.setState({ showLogin: false })}>
                Cancel
              </Button>

            </Form>
          )}
        </Formik>
        <Link href={`/auth/auth0`}>Sign in With Auth0</Link>
      </div >
    );
  }
}

export default Login;
