import React from 'react';
import UserAvailability from '../../components/UserAvailability';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@material-ui/core';
import Avatar from '../../components/Avatar';
import { isUserOrRole } from '../../util';

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
              <ListItemAvatar>
                <Avatar user={user} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
              />
              <ListItemSecondaryAction>
                <UserAvailability
                  buttons
                  member_id={user._id}
                  gigId={id}
                  availability={currentGigAvailability[user._id]}
                  disabled={
                    !isUserOrRole({ role: 'Manager', member_id: user._id }) || isUserOrRole({ role: 'Read-Only' })
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
          )
        })
      }
    </List>
  )
}
