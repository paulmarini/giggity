import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';
import { Typography } from '@material-ui/core';

const MemberNotification = ({ currentUser }) => {
  const preferences = currentUser.preferences && currentUser.preferences.email ? currentUser.preferences.email : { gig_added: false, gig_updated: false, gig_availability_updated: false };

  const submit = async values => {
    await emit('patch', 'members', currentUser.memberId, {
      'preferences.email': values
    });
  }

  const fields = [
    { type: 'Checkbox', label: 'A gig is added', name: 'gig_added' },
    { type: 'Checkbox', label: 'A gig is updated', name: 'gig_updated' },
    { type: 'Checkbox', label: 'A member updates availability', name: 'gig_availability_updated' }
  ]

  return <>
    <Typography gutterBottom variant="body1">Email me when ...</Typography>
    <Form
      initialValues={{ ...preferences }}
      onSubmit={submit}
      fields={fields}
      submitLabel="Save Preferences"
    />
  </>
};

const mapStatetoProps = state => ((({ currentUser }) => ({ currentUser }))(state))

export default connect(mapStatetoProps)(MemberNotification);
