import React, { Component } from 'react';
import { Formik, Form as FormikForm } from 'formik';
import { Button, Grid } from '@material-ui/core';
import Field from './Field';
import './Form.scss';

class Form extends Component {
  submit = async (values, formikBag) => {
    try {
      const res = this.props.onSubmit(values, formikBag);
      await Promise.resolve(res);
    } catch (err) {
      console.error('Form submit error', err);
    }
    formikBag.setSubmitting(false);
  }

  handleChange = (e, handleChange, submitForm) => {
    handleChange(e);
    if (this.props.autoSubmit) {
      setTimeout(submitForm);
    }
  }

  renderForm = (formikProps) => {
    const { fields, submitLabel, buttons = [] } = this.props;

    return (
      <FormikForm className='giggity-form' >
        <Grid container spacing={16}>
          {
            fields.map((field, index) => this.renderField(field, index, formikProps))
          }
          {submitLabel && <div className='buttons'>
            <Button variant='contained' color='primary' type='submit'>{submitLabel}</Button>
            {buttons.map((button, index) => (<span key={index}>{button}</span>))}
          </div>}
        </Grid>
      </FormikForm>
    )
  }

  renderField = (field, index, { handleSubmit, handleChange, handleBlur, submitForm, values, errors }) => {
    if (React.isValidElement(field)) {
      return <Grid item key={index} xs={12}>
        {field}
      </Grid>
    }
    return <Field
      key={index}
      handleChange={e => { this.handleChange(e, handleChange, submitForm); }}
      handleBlur={handleBlur}
      {...field}
    />
  }

  render() {
    const { initialValues, validate } = this.props;
    return (
      <Formik
        onSubmit={this.submit}
        initialValues={initialValues}
        enableReinitialize={true}
        validate={validate}
      >
        {this.renderForm}
      </Formik>
    );
  }
}

export default Form;
