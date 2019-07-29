import React, { Component } from 'react';
import { Formik, Form as FormikForm } from 'formik';
import { Button, Grid, CircularProgress } from '@material-ui/core';
import Field from './Field';
import Effect from '../components/FormikEffect';
import { set } from 'lodash-es';
import { withTheme } from '@material-ui/styles';
import './Form.scss';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      submitting: false
    };
  }

  buttonClick = async (action, index = '') => {
    this.setState({ [`submitting${index}`]: true, disabled: true });
    try {
      await Promise.resolve(action());
    } catch (err) {
      if (err !== 'canceled') {
        console.error(`Button ${index} submit error`, err);
      }
    }
    this.setState({ [`submitting${index}`]: false, disabled: false });
  }

  submit = async (values, formikBag) => {
    await this.buttonClick(() => this.props.onSubmit(values, formikBag));
    formikBag.setSubmitting(false);
  }

  handleChange = (e, handleChange, submitForm) => {
    handleChange(e);
    if (this.props.autoSubmit) {
      setTimeout(submitForm);
    }
  }

  renderButtons = () => {
    const { submitLabel, theme, buttons = [], onCancel, buttonSize = 'medium' } = this.props;
    const { typography: { fontSize } } = theme;
    const sizeOffsets = {
      'small': -2,
      'medium': 0,
      'large': 2
    };
    const progressSize = fontSize + sizeOffsets[buttonSize];
    const submitButton = submitLabel &&
      <Button
        variant='contained'
        size={buttonSize}
        color='primary'
        type='submit'
        disabled={this.state.disabled}
      >
        {this.state.submitting && <CircularProgress className="progress" size={progressSize} />}
        {submitLabel}
      </Button>;
    const cancelButton = onCancel &&
      <Button variant='contained' size={buttonSize} onClick={onCancel}>
        Cancel
      </Button>;

    const extraButtons = buttons.map((button, index) => {
      if (button.label) {
        const { label, action, props = {} } = button;
        return (
          <Button
            key={index}
            variant='outlined'
            onClick={() => this.buttonClick(action, index)}
            size={buttonSize}
            disabled={this.state.disabled}
            {...props}
          >
            {this.state[`submitting${index}`] && <CircularProgress className="progress" size={progressSize} />}
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
        {cancelButton}
      </div>
    )
  }

  renderForm = (formikProps) => {
    const { fields, onChange, children } = this.props;
    const formFields = fields.map((field, index) => this.renderField(field, index, formikProps))
    return (
      <FormikForm className='giggity-form' >
        <Effect onChange={onChange} />
        <Grid container spacing={2}>
          {children}
          {formFields}
          {this.renderButtons()}
        </Grid>
      </FormikForm>
    )
  }

  renderField = (field, index, { handleChange, handleBlur, submitForm, values }) => {
    const { edit } = this.props;
    if (React.isValidElement(field)) {
      return <Grid item key={index} xs={12}>
        {field}
      </Grid>
    }
    const width = 12 / (field.length || 1)
    return (Array.isArray(field) ? field : [field]).map(field => {
      const dynamic = {};
      ['required', 'disabled', 'hidden'].forEach(key => {
        if (field[key] && typeof field[key] === 'function') {
          dynamic[key] = field[key](values);
        }
      })
      return <Field
        key={field.name}
        edit={edit}
        handleChange={e => { this.handleChange(e, handleChange, submitForm); }}
        handleBlur={handleBlur}
        width={width}
        value={values[field.name]}
        {...{ ...field, ...dynamic }}
      />
    })
  }

  render() {
    const { initialValues, validate, fields } = this.props;
    const defaults = fields.reduce((values, { name, default: defaultValue = '' }) => {
      set(values, name, defaultValue);
      return values
    }, {})
    const values = { ...defaults, ...initialValues };

    return (
      <Formik
        onSubmit={this.submit}
        initialValues={values}
        enableReinitialize={true}
        validate={validate}
      >
        {this.renderForm}
      </Formik>
    );
  }
}

export default withTheme(Form);
