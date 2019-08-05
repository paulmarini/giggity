import React from 'react';
import GiggityForm from '../../../components/Form';
import { types } from './CustomFields';

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
      { label: 'Description', name: 'helperText', helperText: 'Additional text to be displayed below the field' }
    ]
    return (
      <GiggityForm
        onSubmit={saveField}
        initialValues={{
          ...field,
        }}
        fields={fields}
        submitLabel="Save Field"
        onChange={(field) => this.setState({ ...this.updateDefaults(field) })}
        onCancel={cancel}
      />
    )
  }
}

export default EditCustomField;
