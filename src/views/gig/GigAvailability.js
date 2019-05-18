import React from 'react';
import UserAvailability from '../../components/UserAvailability';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@material-ui/core';

export default ({ users, currentGigAvailability, id }) => {
  return (
    <List>
      {
        Object.values(users).map(user => {
          return (
            <ListItem
              divider
              key={user._id}
            >
              <ListItemText
                primary={user.name}
              />
              <ListItemSecondaryAction>
                <UserAvailability
                  buttons
                  memberId={user._id}
                  gigId={id} availability={currentGigAvailability[user._id]}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
      }
    </List>
  )
}
