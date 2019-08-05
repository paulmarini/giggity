import React from 'react';
import { types, defaultField } from './CustomFields';

import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  Grid,
} from '@material-ui/core';

import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  RemoveCircleOutline,
  Add
} from '@material-ui/icons';

import GiggityForm from '../../../components/Form';
import { FieldArray } from 'formik';


class FieldList extends React.Component {

  renderField = (field, index, arrayHelpers) => {
    const type = types.find(type => type.value === field.type) || {};
    return (
      <ListItem
        key={index}
        divider
        button={true}
        onClick={() => this.props.editField(index)}
      >
        <ListItemText
          primary={field.label}
          secondary={`${type.label} Field`}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={() => arrayHelpers.move(index, index - 1)}>
            <KeyboardArrowUp fontSize="small" />
          </IconButton>
          <IconButton onClick={() => arrayHelpers.move(index, index + 1)}>
            <KeyboardArrowDown fontSize="small" />
          </IconButton>
          <IconButton onClick={() => arrayHelpers.remove(index)}>
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render() {
    const { fields, saveLabel } = this.props;
    const initialValues = {
      fields: fields.map(field => {
        return {
          ...field,
          options: field.options.join(', ')
        };
      })
    }
    return (
      <GiggityForm
        onSubmit={({ fields }) => this.props.saveProject(fields)}
        initialValues={initialValues}
        fields={[]}
        submitLabel={`Save ${saveLabel}`}
        onChange={(current, prev) => {
          if (current.fields.length > prev.fields.length) {
            this.setState({ editField: current.fields.length - 1 })
          }
        }}
        render={
          formikProps => {
            return <FieldArray
              name="fields"
              render={(arrayHelpers) => (

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => arrayHelpers.push(defaultField)}
                    >
                      <Add /> Add Field
                    </Button>
                  </Box>
                  <List>
                    {(formikProps.values.fields || []).map((field, index) => (
                      this.renderField(field, index, arrayHelpers)
                    ))}
                  </List>
                </Grid>
              )}
            />
          }
        }
      />
    )
  }
}

export default FieldList;
