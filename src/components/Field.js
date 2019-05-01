import { connect } from 'react-redux';
import React from 'react';
import { Field as FormikField } from 'formik';
import { Grid, MenuItem, FormControlLabel, Radio, InputLabel, FormControl, FormLabel, FormHelperText } from '@material-ui/core';
import { TextField, Select, Checkbox, RadioGroup, Switch, CheckboxWithLabel } from 'formik-material-ui';
import './Field.scss';

const Field = fieldData => {
  const users = fieldData.users || [];
  if (React.isValidElement(fieldData)) {
    return <Grid item xs={12} lg={6}>
      {fieldData}
    </Grid>
  }

  let component;
  let children;
  let label;
  const { handleChange, handleBlur } = fieldData;
  const { onChange, onBlur, ...props } = fieldData.props || {}
  switch (fieldData.type) {
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
      label = fieldData.label && <InputLabel shrink>{fieldData.label}</InputLabel>
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
      label = fieldData.label && <InputLabel shrink>{fieldData.label}</InputLabel>
      children = fieldData.options.map((option, index) => {
        return <FormControlLabel key={index} value={option.value || option} control={<Radio />} label={option.label || option} />
      })
      break;
    case 'Checkbox':
    case 'Checkboxes':
      component = CheckboxWithLabel;
      props.Label = { label: fieldData.label };
      break;
    case 'Link':
      component = TextField;
      props.type = 'url';
      break;
    case 'Dropdown':
    case 'Select':
      label = fieldData.label && <InputLabel shrink>{fieldData.label}</InputLabel>
      component = Select;
      children = fieldData.options.map((option, index) => {
        return <MenuItem key={index} value={option.value || option}>{option.label || option}</MenuItem>
      })
      break;
    default:
      component = TextField
  }
  if (!label) {
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

  const field = <FormikField
    name={fieldData.name}
    label={fieldData.label || fieldData.name}
    component={component}
    {...props}
    inputProps={inputProps}
  >
    {children}
  </FormikField>

  return (
    <Grid item xs={12} lg={6} className='form-field'>
      <div className={`form-control field-${fieldData.type}`}>
        {label ?
          (<FormControl fullWidth>
            {label}
            {field}
          </FormControl>) : field
        }
        {fieldData.helperText && <FormHelperText>{fieldData.helperText}</FormHelperText>}
      </div>
    </Grid>
  )
}

const mapStateToProps = state => ({ users: state.users });

export default connect(mapStateToProps)(Field);
