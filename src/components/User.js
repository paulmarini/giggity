import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import { emit } from '../socket';

const defaultState = {
  name: '',
  password: '',
  email: '',
  id: null
}

class User extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.saveUser = this.saveUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  };

  componentDidMount() {
    this.updateUser();
  };

  componentDidUpdate(prevProps) {
    const { id } = this.props.match.params;
    if (id !== prevProps.match.params.id) {
      this.updateUser();
    }
  };


  updateUser = () => {
    const { id } = this.props.match.params;
    if (id) {
      emit('get', 'users', id)
        .then(user => this.setState(user));
    } else {
      this.setState(defaultState);
    }
  };

  saveUser = (values) => {
    const { id } = this.props.match.params;
    this.setState(defaultState);
    return (id ?
      emit('patch', 'users', id, values) :
      emit('create', 'users', values)
    )
      .then(user => {
        if (user._id !== this.props.match.params.id) {
          this.props.history.push(`/users/${user._id}`)
        } else {
          this.setState(user)
        }
      });
  };

  deleteUser = () => {
    const { id } = this.props.match.params;
    return emit('remove', 'users', id)
      .then(() => {
        this.props.history.push(`/`);
      })

  }

  render() {
    const { name } = this.state;
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

const mapStateToProps = state => ({
  users: state.users
})

export default connect(mapStateToProps)(User);
