import React from 'react';
import Link from '../../components/Link'
import { ListItem, ListItemText, ListItemIcon, ListSubheader } from '@material-ui/core';
// import { Link } from 'react-router-dom'

const links = [
  ['Project', 'profile'],
  ['Communication', 'communication'],
  ['Members', 'members'],
  ['Custom Fields', 'custom_fields']
]


class SettingsNav extends React.Component {
  renderListItem = ([text, link]) => {
    const { currentLocation } = this.props;
    return (
      <ListItem
        button
        key={text}
        component={Link}
        to={`/settings/project/${link}`}
        selected={Boolean(currentLocation.match(link))}
      >
        {/* <ListItemIcon></ListItemIcon> */}
        <ListItemText primary={
          text
        } />
      </ListItem>
    )
  }

  render() {
    return [
      <ListSubheader key={0}>Profile Settings</ListSubheader>,
      <ListSubheader key={1}>Project Settings</ListSubheader>,
      ...links.map(this.renderListItem)
    ]
  }
}

export default SettingsNav;
