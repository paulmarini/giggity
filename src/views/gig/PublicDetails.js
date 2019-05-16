import React from 'react';
import GiggityForm from '../../components/Form';

const validate = values => {

}

export default ({ customFields = [], gigValues, saveGig, deleteGig }) => {

  const custom_fields = customFields.map(field => {
    return { ...field, name: `custom_fields.${field.label}` }
  });

  const fields = [
    { type: 'Checkbox', label: 'Private Gig', name: 'private', helperText: 'Private gigs will not be published to the public calendar' },
    { type: 'Text', label: 'Public Title', name: 'public_title' },
    { type: 'Paragraph', label: 'Public Description', name: 'public_description' },
    { type: 'Time', label: 'Event Start Time', name: 'event_startTime' },
    { type: 'Time', label: 'Event End Time', name: 'event_endTime' },
    { type: 'Link', label: 'Public Link', name: 'link' },
    ...custom_fields
  ]

  const deleteButton = {label: 'Delete Gig', action: deleteGig};

  return (
    <GiggityForm
      onSubmit={saveGig}
      initialValues={gigValues}
      fields={fields}
      buttons={[deleteButton]}
      submitLabel="Save Public Details"
      validate={validate}
    />
  );
}