import React, { Component } from 'react';
import { Formik, Form as FormikForm } from 'formik';
import { Button, Grid } from '@material-ui/core';
import Field from './Field';
import Effect from '../components/FormikEffect';
import {set} from 'lodash';
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

  renderButtons = () => {
    const { submitLabel, buttons = [] } = this.props;
    const submitButton = submitLabel &&
      <Button variant='contained' color='primary' type='submit'>
        {submitLabel}
      </Button>;
    const extraButtons = buttons.map((button, index) => {
      if (button.label) {
        const {label, action, props={}} = button;
        return (
          <Button
            key={index}
            variant='outlined'
            onClick={action}
            {...props}
          >
            {label}
          </Button>
        )
      } else {
        return (
          <span key={index}>
            {button}
          </span>
        )
      }
    })
    return (
      <div className='buttons'>
        {submitButton}
        {extraButtons}
      </div>
    )
  }

  renderForm = (formikProps) => {
    const { fields, submitLabel, onChange, buttons = [], children } = this.props;
    const formFields = fields.map((field, index) => this.renderField(field, index, formikProps))
    return (
      <FormikForm className='giggity-form' >
        <Effect onChange={onChange}/>
        <Grid container spacing={16}>
          {children}
          {formFields}
          {this.renderButtons()}
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
    const width = 12 / (field.length || 1)
    return (Array.isArray(field) ? field : [field]).map(field => {
      return <Field
        key={field.name}
        handleChange={e => { this.handleChange(e, handleChange, submitForm); }}
        handleBlur={handleBlur}
        width={width}
        {...field}
      />
    })
  }

  render() {
    const { initialValues, validate, fields } = this.props;
    const defaults = fields.reduce((values, {name, default:defaultValue=''}) => {
      set(values, name, defaultValue);
      return values
    }, {})

    return (
      <Formik
        onSubmit={this.submit}
        initialValues={{...defaults, ...initialValues}}
        enableReinitialize={true}
        validate={validate}
      >
        {this.renderForm}
      </Formik>
    );
  }
}

export default Form;
