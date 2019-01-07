import React, { Component } from 'react';
import requests from './requests';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';

const Statuses = ['Unknown', 'Available', 'Unavailable', 'Maybe'];

class UserAvailability extends Component {

  updateAvailability = (event) => {
    const status = event.target.value;
    const {gigId, userId} = this.props;
    requests.send('updateAvailability', {status, gigId, userId})
  }

  interceptClick = function(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const {status} = this.props;
    return (
      <FormControl onClick={this.interceptClick}>
        <InputLabel>Availability</InputLabel>
        <Select
          value={status || 'Unknown'}
          onChange={this.updateAvailability}
        >
          {
            Statuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)
          }
        </Select>
      </FormControl>
      );
  }

}


export default UserAvailability;
