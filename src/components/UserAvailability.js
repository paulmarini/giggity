import React, { Component } from 'react';
import { emit } from './socket'
import Select from '@material-ui/core/Select';
// import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ThumbUpIcon from '@material-ui/icons/ThumbUpTwoTone';
import ThumbDownIcon from '@material-ui/icons/ThumbDownTwoTone';
import ThumbUpDownIcon from '@material-ui/icons/ThumbsUpDownTwoTone';
import UnknownIcon from '@material-ui/icons/HelpOutline';

const Statuses = [
  { label: 'Available', icon: <ThumbUpIcon fontSize="inherit" color="primary" /> },
  { label: 'Unavailable', icon: <ThumbDownIcon fontSize="inherit" color="secondary" /> },
  { label: 'Maybe', icon: <ThumbUpDownIcon fontSize="inherit" color="action" /> },
  { label: 'Unknown', icon: <UnknownIcon fontSize="inherit" /> },
];

class UserAvailability extends Component {

  updateAvailability = (event, value) => {
    const status = event.target.value || value;
    if (!status) {
      return;
    }
    console.log(status, event.target.value, value)
    const { gigId, userId, availability } = this.props;
    if (userId && gigId) {
      if (availability) {
        emit('patch', 'gig-availability', availability._id, { user: userId, gig: gigId, status });
      } else {
        emit('create', 'gig-availability', { user: userId, gig: gigId, status });
      }
    }
  }

  interceptClick(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const { buttons = false, availability: { status = 'Unknown' } = {} } = this.props;
    if (buttons) {
      return (
        <ToggleButtonGroup
          exclusive
          value={status}
          onChange={this.updateAvailability}
        >
          {
            Statuses.map(status =>
              <ToggleButton
                key={status.label}
                value={status.label}
                style={{ fontSize: 24 }}
              >
                {status.icon}
              </ToggleButton>
            )
          }
        </ToggleButtonGroup>
      )
    }
    return (
      <FormControl onClick={this.interceptClick}>
        <Select
          value={status}
          onChange={this.updateAvailability}
        >
          {
            Statuses.map(status =>
              <MenuItem
                key={status.label}
                value={status.label}
              >
                {status.icon} {status.label}
              </MenuItem>)
          }
        </Select>
      </FormControl>
    );
  }
}


export default UserAvailability;
