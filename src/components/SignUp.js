import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Typography } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { Formik, Form, Field } from 'formik';
import { emit, login, logout } from '../socket'
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const defaultState = {
  email: '',
  name: '',
  password: '',
  project: '',
  error: '',
  activeStep: 0,
  verificationCode: ''
}

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };

  async componentDidMount() {
    await logout();
  }

  submit = async (values, formikBag) => {
    const { activeStep } = this.state;
    try {
      if (activeStep === 0) {
        const { project, email } = values;
        this.setState({ project, email });
        const result = await emit('create', 'registration', { project, email });
        this.setState({ verificationCode: result.verificationCode }) //for debugging only
      } else if (activeStep === 1) {
        const { verificationCode, project, email } = values;
        const result = await emit('patch', 'registration', null, { verified: true }, { verificationCode, email, project });
        await login({ email, password: verificationCode, project: result[0].project_id })
      } else if (activeStep === 2) {
        const { email, name, password } = values;
        const user = await emit('patch', 'users', this.props.currentUser.userId, { name, password });
        await login({ email, password, project: user.project })
        this.props.history.push('/');
      }
      this.setState({ activeStep: activeStep + 1 })
    } catch (e) { }
    formikBag.setSubmitting(false);
  }

  renderCreateForm() {
    return <>
      <Field
        name="email"
        label="Email"
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
    </>
  }

  renderVerifyForm() {
    return <>
      <i>
        this will normally come via email: {this.state.verificationCode}
      </i>
      <Field
        name="verificationCode"
        label="Verification Code"
        data-validators="isRequired"
        fullWidth
        component={TextField}
      />
    </>
  }

  renderSetupForm() {
    return <div style={{ maxWidth: 300, textAlign: 'center', margin: 'auto' }}>
      <Typography variant="body1" gutterBottom>
        We use a service called Auth0 to manage our logins. Click below to set up Auth0. You can either link your Giggity account to a google account, or set up a login and password.
      </Typography>
      <Button color="primary" variant="contained" href="/auth/auth0">
        Set up Auth0
      </Button>
    </div>
  }

  render() {
    const { activeStep } = this.state;
    return <>
      <Typography variant="h5">Create a new Giggity Project</Typography>
      <Stepper activeStep={activeStep}>
        {
          ['Sign Up', 'Verify Email', 'Complete'].map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))
        }
      </Stepper>
      {activeStep === 2 ?
        this.renderSetupForm() :
        <Formik onSubmit={this.submit} initialValues={this.state} enableReinitialize={true}>
          {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
            <Form autocomplete="off">
              {activeStep === 0 && this.renderCreateForm()}
              {activeStep === 1 && this.renderVerifyForm()}
              <Button variant="contained" type="submit" color="primary">
                Next
              </Button>
            </Form>
          )}
        </Formik>
      }
    </>
  }
}

export default connect(
  state => ((({ currentUser }) => ({ currentUser }))(state))
)(SignUp);
