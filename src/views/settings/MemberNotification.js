import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';
import {
  Typography,
  List,
  Link,
  ListItem
} from '@material-ui/core';
import { capitalize } from 'lodash-es';

const MemberNotification = ({ currentUser, calendar={}, communication = {} }) => {
  const preferences = currentUser.preferences && currentUser.preferences.email ? currentUser.preferences.email : { gig_added: false, gig_updated: false, gig_availability_updated: false };

  const submit = async values => {
    await emit('patch', 'members', currentUser.member_id, {
      'preferences.email': values
    });
  }
  const fields = [
    { type: 'Checkbox', label: 'A gig is added', name: 'gig_added' },
    { type: 'Checkbox', label: 'A gig is updated', name: 'gig_updated' },
    { type: 'Checkbox', label: 'A member updates availability', name: 'gig_availability_updated' }
  ]

  return <>
    <Typography gutterBottom variant="body1">Calendar Links</Typography>
    <List>
      {
        ['gig', 'rehearsal', 'public'].map(type => {
          if (!communication[`enable_${type}_calendar`]) {
            return null;
          }
          return <ListItem
            button
            component={Link}
            key={type}
            href={`https://calendar.google.com/calendar?cid=${calendar[`${type}_calendar_id`]}`}
            target="_blank"
            color="primary"
          >
            {`${capitalize(type)} Calendar`}
          </ListItem>
        })
      }
    </List>
    <Typography gutterBottom variant="body1">Email me when ...</Typography>
    <Form
      initialValues={{ ...preferences }}
      onSubmit={submit}
      fields={fields}
      submitLabel="Save Preferences"
    />

  </>
};

const mapStatetoProps = state => ({
  currentUser: state.currentUser,
  calendar: state.currentProject.calendar,
  communication: state.currentProject.communication,
});

export default connect(mapStatetoProps)(MemberNotification);
