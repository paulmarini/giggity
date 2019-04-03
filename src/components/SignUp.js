import React, { Component } from 'react';
import { Button, Typography } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { Formik, Form, Field } from 'formik';
import { emit } from '../socket'

const defaultState = {
  email: 'greg@primate.net',
  name: 'Greg Michalec',
  password: 'a',
  project: 'New Project',
  error: ''
}

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  saveProject = async (values, formikBag) => {
    this.setState(defaultState);
    const _id = values.project.toLowerCase().replace(/[^a-z0-9]/g, '_');
    try {
      const project = await emit('create', 'projects', { _id, name: values.project });
      console.log(project);

    } catch (e) { }
    formikBag.setSubmitting(false);

  }

  render() {
    const { email, name, project, password } = this.state;
    return (
      <>
        <Typography variant="h5">Create a new Giggity Project</Typography>
        <Formik onSubmit={this.saveProject} initialValues={{ email, name, project, password }} enableReinitialize={true}>
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
                name="name"
                label="Name"
                data-validators="isRequired"
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
                Register
              </Button>
            </Form>
          )}
        </Formik>
      </>
    );
  }

}

export default SignUp;
