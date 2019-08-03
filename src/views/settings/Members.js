import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Fab
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Add as AddIcon
} from '@material-ui/icons';
import Avatar from '../../components/Avatar';
import Form from '../../components/Form';
import { emit } from '../../socket';
import confirm from '../../util/confirm';
import './Members.scss';

const roles = ['Admin', 'Manager', 'Member', 'Read-Only']
const defaulState = {
  email: '',
  role: 'Member',
  editMember: null,
  showInvite: false
}

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = defaulState;

    this.userFields = [
      { type: 'Text', name: 'email', label: 'Email' },
      { type: 'Select', name: 'role', label: 'Role', options: roles }
    ]
  }

  inviteMember = async values => {
    await emit('create', 'users', { email: values.email, name: values.email, role: values.role });
    this.setState({ showInvite: false });
  }

  updateMember = async (values) => {
    await emit('patch', 'members', values._id, values);
  }

  deleteMember = async ({ name, _id: id }) => {
    await confirm(`Delete the member "${name}"?`, { okLabel: 'Delete' });
    await emit('remove', 'members', id);
  }

  renderEditMember(user) {
    return (
      <ListItem key={`edit_${user._id}`}>
        <Form
          initialValues={user}
          className='edit-member'
          fields={[
            { 'label': 'Role', type: 'Select', name: 'role', options: roles },
          ]}
          onSubmit={this.updateMember}
          submitLabel="Save"
          onCancel={() => this.setState({ editMember: null })}
          buttons={[
            {
              label: 'Delete',
              action: () => this.deleteMember(user),
              props: {
                color: "secondary",
                variant: 'contained'
              }
            }
          ]}
          buttonSize="small"
        />
      </ListItem>
    )
  }

  renderListItem(user) {
    const isEditMember = this.state.editMember === user._id;
    return (
      <ListItem
        key={user._id}
        className='member'
        button={!isEditMember}
        onClick={() => this.setState({ editMember: user._id })}
      >
        <ListItemAvatar>
          <Avatar user={user} />
        </ListItemAvatar>
        <ListItemText
          primary={user.name}
          secondary={`${user.role} - ${user.email}`}
        />

        <ListItemSecondaryAction>
          {
            !isEditMember &&
            <IconButton
              color="inherit"
              onClick={() => this.setState({ editMember: user._id })}
            >
              <EditIcon />
            </IconButton>
          }
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render() {
    return (
      <div className="members">
        <Fab
          color="primary"
          className='add-icon'
          size="small"
          onClick={() => this.setState({ showInvite: true })}
        >
          <AddIcon />
        </Fab>
        {
          this.state.showInvite && <>
            <Typography gutterBottom variant="subtitle1">Invite Member</Typography>
            <Form
              initialValues={this.state}
              fields={this.userFields}
              submitLabel='Invite Member'
              onSubmit={this.inviteMember}
              onCancel={() => this.setState({ showInvite: false })}
            />
          </>
        }
        <List>
          {
            Object.values(this.props.users)
              .map(user => ([
                this.renderListItem(user),
                this.state.editMember === user._id && this.renderEditMember(user)
              ]))
          }
        </List>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  users: state.users
})

export default connect(mapStateToProps)(Users);
