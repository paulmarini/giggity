import React from 'react';
import Link from '../components/Link'
import { ListItem, ListItemText, ListItemIcon, ListSubheader } from '@material-ui/core';
// import { Link } from 'react-router-dom'

const links = [
  ['Profile', 'profile'],
  ['Communication', 'communication'],
  ['Members', 'members'],
  ['Custom Fields', 'custom_fields']
]

const ProjectNav = ({ currentLocation }) => {
  return [<ListSubheader key={0}>Project Settings</ListSubheader>, ...links.map(([text, link]) => (
    <ListItem
      button
      key={text}
      component={Link}
      to={`/project/${link}`}
      selected={Boolean(currentLocation.match(link))}
    >
      {/* <ListItemIcon></ListItemIcon> */}
      <ListItemText primary={
        text
      } />
    </ListItem>
  ))];
};

export default ProjectNav;
