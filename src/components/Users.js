import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router-dom'
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

const Users = props => (
  <div className="Users">
    {
      props.users.map(user => (
        <div key={user._id}>
          <RouterLink to={`/members/${user._id}`}>
            {user.name}
          </RouterLink>
        </div>
      ))
    }
    <Button component={RouterLink} to="/members/new">Add User</Button>
  </div>
)

export default Users;
