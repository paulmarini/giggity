import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';

const ProjectCommunication = ({ currentProject: { _id, communication } }) => {

  const submit = async values => {
    await emit('patch', 'projects', _id, values);
  }

  const fields = [
    { type: 'Email', label: 'Public Email List', name: 'communication.email_list', helperText: 'An email address to send public gig details to your fans' },
    { type: 'Checkbox', label: 'Enable Calendar', name: 'communication.enable_gig_calendar', defaultValue: false },
    { type: 'Checkbox', label: 'Enable Rehearsal Calendar', name: 'communication.enable_rehearsal_calendar', defaultValue: false },
    { type: 'Checkbox', label: 'Enable Public Calendar', name: 'communication.enable_public_calendar', defaultValue: false },
  ]

  return <>
    <Form
      initialValues={{ communication }}
      onSubmit={submit}
      fields={fields}
      submitLabel="Save Project"
    />
  </>
};

const mapStatetoProps = state => ({
  currentProject: state.currentProject
});

export default connect(mapStatetoProps)(ProjectCommunication);
