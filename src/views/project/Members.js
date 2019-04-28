import React, { Component } from 'react';
import Link from '../../components/Link';
import {
  IconButton,
  Typography,
  Select,
  MenuItem
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import Form from '../../components/Form';
import Field from '../../components/Field';
import { emit } from '../../socket';
import './Members.scss';
const roles = ['Admin', 'Manager', 'Member', 'Read-Only']
const defaulState = {
  email: '',
  role: 'Member'
}

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = defaulState;

    this.userFields = [
      { type: 'Text', name: 'email', label: 'Email' },
      { type: 'Dropdown', name: 'role', label: 'Role', options: roles }
    ]
  }

  inviteMember = async values => {
    const member = await emit('create', 'users', { email: values.email, name: values.email, role: values.role });
    console.log(member);
  }

  updateMember = async (values) => {
    console.log('update', values);
    await emit('patch', 'user-access', values._id, values);
  }

  deleteMember = id => async () => {
    const member = await emit('remove', 'user-access', id);
    console.log(member);
  }

  render() {

    return (
      <div className="members">
        <Typography gutterBottom variant="subtitle1">Members</Typography>
        {
          this.props.users.map(user => (
            <div key={user._id} className='member'>
              {user.name}
              <Form
                initialValues={user}
                fields={[{
                  type: 'Dropdown', name: 'role', options: roles
                }]}
                autoSubmit={true}
                onSubmit={this.updateMember}
              />
              <IconButton
                color="inherit"
                onClick={this.deleteMember(user._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))
        }
        <Typography gutterBottom variant="subtitle1">Invite Member</Typography>
        <Form initialValues={this.state} fields={this.userFields} submitLabel='Invite Member' onSubmit={this.inviteMember} />
      </div>
    )
  }
}

export default Users;
