import React, { Component } from 'react';
import { Formik, Form as FormikForm } from 'formik';
import { Button } from '@material-ui/core';
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

  render() {
    const { initialValues, fields, submitLabel, buttons = [] } = this.props;
    return (
      <Formik onSubmit={this.submit} initialValues={initialValues} enableReinitialize={true} >
        {({ handleSubmit, handleChange, handleBlur, submitForm, values, errors }) => (
          <FormikForm className='giggity-form' >
            {
              fields.map((field, index) => {
                return <Field key={index} handleChange={e => { this.handleChange(e, handleChange, submitForm); }} handleBlur={handleBlur} {...field} />
              })
            }
            {submitLabel && <div className='buttons'>
              <Button variant='contained' color='primary' type='submit'>{submitLabel}</Button>
              {buttons.map((button, index) => (<span key={index}>{button}</span>))}
            </div>}
          </FormikForm>
        )}
      </Formik>
    );
  }
}

export default Form;
