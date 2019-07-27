import { connect } from 'react-redux';
import React from 'react';
import { Field as FormikField } from 'formik';
import { Grid, MenuItem, FormControlLabel, Radio, InputLabel, FormControl, FormLabel, FormHelperText } from '@material-ui/core';
import { TextField, Select, Checkbox, RadioGroup, Switch, CheckboxWithLabel } from 'formik-material-ui';
import './Field.scss';

class Field extends React.Component {
  render() {
    const { name, type, label, options, helperText, users = [], handleChange, handleBlur, validate, required, disabled, hidden = false, width = 12, edit = true, value, props: { onChange, onBlur, ...props } = {} } = this.props;

    let component;
    let children;
    let labelElement;
    if (hidden) {
      return <FormikField
        key={name}
        name={name}
        validate={validate}
        required={required}
        disabled={disabled}
        render={() => null}
      >
      </FormikField>
    }
    if (!edit) {
      return (
        <Grid item xs={12} className='form-field'>
          <Grid container spacing={2}>
            <Grid item xs={4} style={{ textAlign: 'right' }}>
              <b>{label}</b>
            </Grid>
            <Grid item xs={6}>
              {value}
            </Grid>
          </Grid>
        </Grid>
      )
    }

    switch (type) {
      case 'Paragraph':
        props.multiline = true;
        props.rows = props.rows || 5;
        component = TextField;
        break;
      case 'DateTime':
        props.type = 'datetime-local';
        component = TextField;
        break;
      case 'Date':
        props.type = 'date';
        component = TextField;
        break;
      case 'Member':
        labelElement = label && <InputLabel shrink>{label}</InputLabel>
        component = Select;
        children = users.map(({ _id, name }) => {
          return <MenuItem key={_id} value={_id}>{name}</MenuItem>
        })
        break;
      case 'Time':
        props.type = 'time';
        component = TextField;
        break;
      case 'Email':
        component = TextField
        props.type = 'email';
        break;
      case 'Text':
        component = TextField
        break;
      case 'Multiple choice':
      case 'Radio':
        component = RadioGroup;
        labelElement = label && <InputLabel shrink>{label}</InputLabel>
        children = options.map((option, index) => {
          return <FormControlLabel key={index} value={option.value || option} control={<Radio />} label={option.label || option} />
        })
        break;
      case 'Checkbox':
      case 'Checkboxes':
        component = CheckboxWithLabel;
        props.Label = { label: label };
        break;
      case 'Link':
        component = TextField;
        props.type = 'url';
        break;
      case 'Dropdown':
      case 'Select':
        labelElement = label && <InputLabel shrink>{label}</InputLabel>
        component = Select;
        children = options.map((option, index) => {
          return <MenuItem key={index} value={option.value || option}>{option.label || option}</MenuItem>
        })
        break;
      default:
        component = TextField
    }
    if (!labelElement) {
    }
    if (component === TextField) {
      props.fullWidth = true;
      props.InputLabelProps = { shrink: true }
    }
    const inputProps = {}
    if (handleChange) {
      inputProps.onChange = e => {
        handleChange && handleChange(e); onChange && onChange(e);
      }
    }

    if (handleBlur) {
      inputProps.onBlur = e => {
        handleBlur && handleBlur(e); onBlur && onBlur(e);
      }
    }

    if (component === RadioGroup) {
      Object.assign(props, inputProps)
    } else {
      props.inputProps = inputProps
    }

    const field = <FormikField
      name={name}
      label={label !== null ? label : name}
      component={component}
      validate={validate}
      required={required}
      disabled={disabled}
      {...props}
    >
      {children}
    </FormikField>

    return (
      <Grid item xs={width} className='form-field'>
        <div className={`form-control field-${type}`}>
          {labelElement ?
            (<FormControl fullWidth required={required} disabled={disabled}>
              {labelElement}
              {field}
            </FormControl>) : field
          }
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </div>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ users: state.users });

export default connect(mapStateToProps)(Field);
