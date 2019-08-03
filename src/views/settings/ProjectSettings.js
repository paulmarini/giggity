import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  IconButton,
  Grid
} from '@material-ui/core';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  RemoveCircleOutline
} from '@material-ui/icons';
import GiggityForm from '../../components/Form';
import { emit } from '../../socket'
import { FieldArray } from 'formik';

const defaultField = {
  label: 'New Field',
  type: 'Text',
  options: [],
  default: '',
  public: false
}

const types = [
  { label: 'Text', value: 'Text' },
  { label: 'Paragraph', value: 'Paragraph' },
  { label: 'Link', value: 'Link' },
  { label: 'Dropdown', value: 'Select' },
  { label: 'Member', value: 'Member' },
  { label: 'Checkbox', value: 'Checkbox' },
  { label: 'Multiple Choice', value: 'Radio' },
  { label: 'Date', value: 'Date' },
  { label: 'Time', value: 'Time' },
];

class ProjectSettings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editField: null
    };
  }

  saveProject = async (values) => {
    const { currentProject } = this.props;
    await emit('patch', 'projects', currentProject._id, {
      custom_fields: values.custom_fields
    });
    this.setState({ editField: null });
  }

  renderField = (field, index, arrayHelpers) => {
    return (
      <ListItem
        key={index}
        divider
        button={true}
        onClick={() => this.setState({ editField: index })}
      >
        <ListItemText
          primary={field.label}
          secondary={`${types.find(type => type.value === field.type).label} Field`}
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

  renderList() {
    const { currentProject: { custom_fields } } = this.props;
    const initialValues = {
      custom_fields: custom_fields.map(field => {
        return {
          ...field,
          options: field.options.join(', ')
        };
      })
    }
    return (
      <GiggityForm
        onSubmit={this.saveProject}
        initialValues={initialValues}
        fields={[]}
        submitLabel="Save Fields"
        onChange={(current, prev) => {
          if (current.custom_fields.length > prev.custom_fields.length) {
            this.setState({ editField: current.custom_fields.length - 1 })
          }
        }}
        render={formikProps => {
          return <FieldArray
            name="custom_fields"
            render={(arrayHelpers) => (
              <Grid item xs={12}>
                <List>
                  {(formikProps.values.custom_fields || []).map((field, index) => (
                    this.renderField(field, index, arrayHelpers)
                  ))}
                  <Button onClick={() => arrayHelpers.push(defaultField)}>
                    Add Field
                  </Button>
                </List>
              </Grid>
            )}
          />
        }
        }
      />
    )
  }

  saveField = (field) => {
    const index = this.state.editField;
    const custom_fields = [...this.props.currentProject.custom_fields];
    custom_fields[index] = {
      ...field,
      options: field.options && field.options.split(',').map(option => option.trim())
    };
    return this.saveProject({ custom_fields })
  }

  render() {
    const index = this.state.editField;
    if (index !== null) {
      const field = this.props.currentProject.custom_fields[index] || defaultField;
      return <EditCustomField
        field={{
          ...field,
          options: field.options.join(', ')
        }}
        saveField={this.saveField}
        cancel={() => this.setState({ editField: null })}
      />;
    }
    return this.renderList();
  }
}

const mapStatetoProps = state => ((({ currentProject }) => ({ currentProject }))(state))

export default connect(mapStatetoProps)(ProjectSettings);

class EditCustomField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.updateDefaults(props.field)
    }
  }

  updateDefaults = field => {
    const defaults = {
      Select: {
        type: 'Select',
        showOptions: true,
        options: field.options !== null && field.options.split(',').map(option => option.trim())
      },
      Radio: {
        type: 'Select',
        showOptions: true,
        options: field.options !== null && field.options.split(',').map(option => option.trim())
      },
      'Checkbox': {
        type: 'Radio',
        showOptions: false,
        options: [{ label: 'Checked', value: 'true' }, { label: 'UnChecked', value: 'false' }]
      },
      'Member': {
        type: 'Member',
      }
    }
    return defaults[field.type] || { type: 'Text', options: null, showOptions: false }
  }

  render() {
    const { field, saveField, cancel } = this.props;
    const fields = [
      { label: 'Label', name: 'label', required: true },
      {
        label: 'Type', type: 'Select', name: 'type', required: true, options: types
      },
      { label: 'Options', name: 'options', required: !this.state.showOptions, hidden: !this.state.showOptions, helperText: "Separate options by comma" },
      { label: 'Default Value', name: 'default', type: this.state.type, options: this.state.options },
      { label: 'Description', name: 'helperText', helperText: 'Additional text to be displayed below the field' },
      { label: 'Public Field', type: 'Checkbox', name: 'public', helperText: "Public fields will be displayed on your public calendar and fan update emails" },
    ]
    return (
      <GiggityForm
        onSubmit={saveField}
        initialValues={{
          ...field,
        }}
        fields={fields}
        submitLabel="Save Fields"
        onChange={(field) => this.setState({ ...this.updateDefaults(field) })}
        onCancel={cancel}
      />
    )
  }
}
