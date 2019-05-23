import React from 'react';
import GiggityForm from '../../components/Form';
import {
  Grid,
  Typography
} from '@material-ui/core';

class GigDetails extends React.Component {

  constructor(props) {
    super(props);
    const { customFields = [] } = props;
    this.custom_fields = customFields
      .reduce((fields, field) => {
        fields[field.public ? 'public' : 'band'].push({
          ...field,
          name: `custom_fields.${field.label}`
        })
        return fields;
      }, { public: [], band: [] });
    this.state = {
      fields: this.updateFields()
    }
  }

  onComponentDidUpdate(oldProps) {
    const { type } = this.props;
    if (oldProps.type !== type || !this.fields.length) {
      this.setState({ fields: this.updateFields() });
    }
  }

  updateFields() {
    const { type } = this.props;
    const fields = (type === 'Gig' ?
      [
        { type: 'Radio', label: 'Status', name: 'status', options: ['Draft', 'Proposed', 'Confirmed', 'Cancelled'], helperText: 'Draft gigs are hidden from members.' },
        { type: 'Text', label: 'Name', name: 'name', required: true },
        { type: 'Date', label: 'Date', name: 'date', required: true },
        [
          { type: 'Time', label: 'Start Time', name: 'startTime' },
          { type: 'Time', label: 'End Time', name: 'endTime', required: values => Boolean(values.startTime) },
        ],
        { type: 'Text', label: 'Location', name: 'location' },
        { type: 'Paragraph', label: 'Description', name: 'description' },
        { type: 'Time', label: 'Load In', name: 'load_inTime' },
        ...this.custom_fields['band']
      ] :
      [
        { type: 'Text', label: 'Name', name: 'name' },
        { type: 'Date', label: 'Date', name: 'date' },
        [
          { type: 'Time', label: 'Start Time', name: 'startTime' },
          { type: 'Time', label: 'End Time', name: 'endTime' }
        ],
        { type: 'Text', label: 'Location', name: 'location' },
        { type: 'Paragraph', label: 'Description', name: 'description' },
      ])
      .map(this.hideFields('details'));

    const public_fields = type === 'Rehearsal' ? [] : [
      { type: 'Checkbox', label: 'Private Gig', name: 'private', helperText: 'Private gigs will not be published to the public calendar', defaultValue: true },
      { type: 'Text', label: 'Public Title', name: 'public_title', required: values => !values.private },
      { type: 'Paragraph', label: 'Public Description', name: 'public_description', required: values => !values.private },
      [
        { type: 'Time', label: 'Event Start Time', name: 'event_startTime' },
        { type: 'Time', label: 'Event End Time', name: 'event_endTime', required: values => Boolean(values.event_startTime) }
      ],
      { type: 'Link', label: 'Public Link', name: 'link' },
      ...this.custom_fields['public']
    ]
      .map(this.hideFields('public_details'));

    return [...fields, ...public_fields];
  }


  hideFields = fieldType => field => {
    const { mode } = this.props;
    if (Array.isArray(field)) {
      return field.map(f => ({ ...{ hidden: mode !== fieldType }, ...f }))
    } else {
      return { ...{ hidden: mode !== fieldType }, ...field }
    }
  }

  render() {
    const { saveGig, deleteGig, gigValues } = this.props;

    const deleteButton = { label: 'Delete Gig', action: deleteGig };
    return (
      <GiggityForm
        onSubmit={saveGig}
        initialValues={gigValues}
        fields={this.state.fields}
        buttons={[deleteButton]}
        submitLabel="Save Gig"
      >
      </GiggityForm>
    );
  }
}

export default GigDetails;
