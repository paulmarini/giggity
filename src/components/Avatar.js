import React from 'react';
import { Avatar } from '@material-ui/core';

export default React.forwardRef(
  ({ user, ...props }, ref) => (
    <Avatar
      src={user.photo}
      {...props}
      ref={ref}
    >
      {user.name[0].toUpperCase()}
    </Avatar>
  )
)
