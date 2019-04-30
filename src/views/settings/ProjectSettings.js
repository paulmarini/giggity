import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import {
  Typography,
  List,
  ListItem,
  Button,
  IconButton,
  InputLabel,
  FormControl,
  Chip,
  Grid
} from '@material-ui/core';
import { emit } from '../../socket'
import { KeyboardArrowUp, KeyboardArrowDown, RemoveCircleOutline } from '@material-ui/icons';
import { Formik, Form, FieldArray } from 'formik';
import Field from '../../components/Field';
const defaultField = {
  label: '',
  type: 'Text',
  options: ['obe', 'two'],
  default: '',
  private: false
}

const types = ['Text', 'Paragraph', 'Link', 'Dropdown', 'Member', 'Checkboxes', 'Multiple choice', 'Date', 'Time'];

class ProjectSettings extends Component {

  saveProject = async (values, formikBag) => {
    const { currentProject } = this.props;
    await emit('patch', 'projects', currentProject._id, {
      ...values,
      custom_fields: values.custom_fields.map(field => ({
        ...field,
        options: field.options.split(',').map(option => option.trim())
      }))
    });
    formikBag.setSubmitting(false);
  }

  renderField = (field, index, arrayHelpers) => {
    return (
      <ListItem key={index} divider>
        <Grid container direction="row" spacing={24}>
          <Field
            label='Label'
            name={`custom_fields[${index}].label`}
            data-validators="isRequired"
          />
          <Field
            label="Type"
            name={`custom_fields[${index}].type`}
            data-validators="isRequired"
            type='Select'
            options={types}
          />
          {
            ['Dropdown', 'Multiple Choice'].includes(field.type) &&
            <Field
              label="Options"
              name={`custom_fields[${index}].options`}
              onChange={e => console.log(e)}
            />
          }
          <Field
            label="Default Value"
            name={`custom_fields[${index}].default`}
          />
          <Field
            name={`custom_fields[${index}].private`}
            label='Private Field'
            type='Checkboxes'
          />
          <IconButton onClick={() => arrayHelpers.move(index, index - 1)}>
            <KeyboardArrowUp fontSize="small" />
          </IconButton>
          <IconButton onClick={() => arrayHelpers.move(index, index + 1)}>
            <KeyboardArrowDown fontSize="small" />
          </IconButton>
          <IconButton onClick={() => arrayHelpers.remove(index)}>
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        </Grid>
      </ListItem>
    )
  }

  render() {
    const { currentProject } = this.props;
    const initialValues = {
      ...currentProject,
      custom_fields: currentProject.custom_fields.map(field => ({
        ...field,
        options: field.options.join(', ')
      }))

    }
    return (
      <>
        <Helmet>
          <title>{`Giggity - ${currentProject.name} Settings`}</title>
        </Helmet>
        <Formik
          onSubmit={this.saveProject}
          initialValues={initialValues}
          render={formProps => {
            return (
              <Form>
                <Button type='submit'>
                  Save Settings
                        </Button>
                <Typography gutterBottom variant="h5">Custom Fields</Typography>
                <FieldArray
                  name="custom_fields"
                  render={(arrayHelpers) => (
                    <List>
                      {formProps.values.custom_fields.map((field, index) => (
                        this.renderField(field, index, arrayHelpers)
                      ))}
                      <Button onClick={() => arrayHelpers.push(defaultField)}>
                        Add Field
                        </Button>
                    </List>
                  )}
                />
              </Form>
            )
          }}
        />
      </>
    );
  }

}
const mapStatetoProps = state => ((({ currentProject }) => ({ currentProject }))(state))

export default connect(mapStatetoProps)(ProjectSettings);
