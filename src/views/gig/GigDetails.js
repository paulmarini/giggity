import React from 'react';
import GiggityForm from '../../components/Form';

class GigDetails extends React.Component {

  constructor(props) {
    super(props);
    const { customFields = [], gigValues, type} = props;

    this.state = {
      endRequired: Boolean(props.gigValues.startTime)
    };
    
    this.custom_fields = customFields.map(field => {
      return { ...field, name: `custom_fields.${field.label}` }
    });
  }
  
  componentDidUpdate(prevProps) {
    this.onChange(this.props.gigValues, prevProps.gigValues);
  }

  validate(values) {
    const errors = {}
    if (values.startTime && values.endTime <= values.startTime) {
      errors.endTime = 'End time must be after start time'
    } else if (values.startTime && !values.endTime) {
      errors.endTime = 'End time must be set if start time is set'
    }
    return errors;
  }
  
  onChange = (values, oldValues) => {
    if (values.startTime !== oldValues.startTime) {
      this.setState({endRequired: Boolean(values.startTime)});
    }
  }

  render() {
    const { saveGig, deleteGig, gigValues, type } = this.props;
    const fields = type === 'Gig' ? 
    [
      { type: 'Radio', label: 'Status', name: 'status', options: ['Proposed', 'Confirmed', 'Canceled'] },
      { type: 'Text', label: 'Name', name: 'name', required: true},
      { type: 'Date', label: 'Date', name: 'date', required: true},
      [
        { type: 'Time', label: 'Start Time', name: 'startTime'},
        { type: 'Time', label: 'End Time', name: 'endTime', required: this.state.endRequired},
      ],
      { type: 'Text', label: 'Location', name: 'location' },
      { type: 'Paragraph', label: 'Description', name: 'description' },
      { type: 'Time', label: 'Load In', name: 'load_inTime' },
      ...this.custom_fields
    ]:
    [
      { type: 'Text', label: 'Name', name: 'name' },
      { type: 'Date', label: 'Date', name: 'date' },
      [
        { type: 'Time', label: 'Start Time', name: 'startTime' },
        { type: 'Time', label: 'End Time', name: 'endTime' }
      ],
      { type: 'Text', label: 'Location', name: 'location' },
      { type: 'Paragraph', label: 'Description', name: 'description' },
    ];

    const deleteButton = {label: 'Delete Gig', action: deleteGig};
    return (
      <GiggityForm
        onSubmit={saveGig}
        initialValues={gigValues}
        fields={fields}
        buttons={[deleteButton]}
        submitLabel="Save Gig"
        validate={this.validate}
        onChange={this.onChange}
      >
        </GiggityForm>
    );
  }
}

export default GigDetails;