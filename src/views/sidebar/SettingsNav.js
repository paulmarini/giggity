import React from 'react';
import Link from '../../components/Link'
import { List, ListItem, ListItemText, ListItemIcon, ListSubheader } from '@material-ui/core';
// import { Link } from 'react-router-dom'
import {
  Person,
  Group,
  Notes,
  Mail,
  Settings,
  Notifications,
  Event,
} from '@material-ui/icons';

const profile_links = [
  ['Profile', 'profile/profile', <Person />],
  ['Notifications', 'profile/notifications', <Notifications />]
];

const project_links = [
  ['Project', 'project/profile', <Settings />],
  ['Members', 'project/members', <Group />],
  ['Communication', 'project/communication', <Mail />],
  ['Custom Fields', 'project/custom_fields', <Notes />],
  ['Rehearsals', 'project/rehearsals', <Event />],
]


class SettingsNav extends React.Component {
  renderListItem = ([text, link, icon]) => {
    const { currentLocation, handleDrawerToggle } = this.props;
    return (
      <ListItem
        button
        key={text}
        component={Link}
        to={`/settings/${link}`}
        color="inherit"
        selected={Boolean(currentLocation.match(link))}
        onClick={handleDrawerToggle}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={
          text
        } />
      </ListItem>
    )
  }

  render() {
    return (
      <List>
        <ListSubheader disableSticky>Profile Settings</ListSubheader>
        {profile_links.map(this.renderListItem)}
        <ListSubheader disableSticky>Project Settings</ListSubheader>
        {project_links.map(this.renderListItem)}
      </List>
    );
  }
}

export default SettingsNav;
