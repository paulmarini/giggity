import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router-dom'
import Link from '@material-ui/core/Link';


// class NiceLink extends React.Component {
//   renderLink = itemProps => <RouterLink to={this.props.to} {...itemProps} />;
//
//   render() {
//     const { children, to, ...props } = this.props;
//     return (
//       <Link component={this.renderLink} {...props}>
//         {children}
//       </Link>
//     );
//   }
// }

const Users = props => (
  <div className="Users">
    {
      props.users.map(user => (
        <div key={user._id}>
          {/* <NiceLink to={`members/${user._id}`}>
            {user.name}
          </NiceLink> */}
          <RouterLink to={`/members/${user._id}`}>
            {user.name}
          </RouterLink>
        </div>
      ))
    }
  </div>
)

export default Users;
