import React, { Component } from 'react';
import requests from './requests';
import { Button } from '@material-ui/core';
import {TextField} from 'formik-material-ui';

import { Formik, Form, Field } from 'formik';

const defaultState = {
  name: '',
  password: '',
  email: '',
  id: null
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    console.error('USER')
  };
  componentDidMount () {
    requests.register('userUpdated', (data) => {
      const {id} = this.props.match.params;
      if (id) {
        this.setState(data)
      }
    });
    this.updateUser();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {id} = this.props.match.params;
    if (id !== prevProps.match.params.id) {
      this.updateUser();
    }
  };
  componentWillUnmount () {
    requests.unregister('userUpdated');
  };
  updateUser = () => {
    const {id} = this.props.match.params;
    if (id) {
      requests.send('fetchUser', id);
    } else {
      this.setState(defaultState);
    }
  };

  saveUser = (values) => {
    console.log(values);
    this.setState(defaultState);
    return requests.save('user', values)
      .then(user => {
        console.log(user);
        if (user.id !== this.props.match.params.id) {
          this.props.history.push(`/users/${user.id}`)
        }
      });
  };

  deleteUser = () => {
    const {id} = this.props.match.params;
    return requests.delete('user', id)
      .then(() => {
        this.props.history.push(`/`);
      })

  }

  render() {
    const {name} = this.state;
    return (
      <div>
        <h3>{name}</h3>
        <Formik onSubmit={this.saveUser} initialValues={this.state} enableReinitialize={true}>
          {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
            <Form>
              <Field
                name="name"
                label="Name"
                data-validators="isRequired"
                component={TextField}
              />
              <Field
                name="password"
                label="Password"
                type="password"
                component={TextField}
              />
              <Field
                name="email"
                label="Email"
                type="email"
                data-validators="isRequired"
                component={TextField}
              />
              <Button variant="contained" type="submit" color="primary">
                Save User
              </Button>
              <Button variant="contained" onClick={this.deleteUser} color="secondary">
                Delete User
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    );
  }
}

export default Home;
