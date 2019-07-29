import React, { Component } from 'react';
import { emit } from '../socket'
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

  updateAvailability = async (event, value) => {
    const status = event.target.value || value;
    if (!status) {
      return;
    }
    const { gigId, member_id, availability } = this.props;
    const data = { member: member_id, gig: gigId, status };
    if (member_id && gigId) {
      if (availability) {
        await emit('patch', 'gig-availability', availability._id, data);
      } else {
        await emit('create', 'gig-availability', data);
      }
    }
    if (this.props.updateCallback) {
      this.props.updateCallback(data)
    }
  }

  interceptClick(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const { buttons = false, availability: { status = 'Unknown' } = {}, disabled = false } = this.props;
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
                disabled={disabled}
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
          disabled={disabled}
        >
          {
            Statuses.map(status =>
              <MenuItem
                key={status.label}
                value={status.label}
              >
                {/* {status.icon} */}
                {status.label}
              </MenuItem>)
          }
        </Select>
      </FormControl>
    );
  }
}


export default UserAvailability;
