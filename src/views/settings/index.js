import React from 'react';
import Members from './Members';
import ProjectProfile from './ProjectProfile';
import ProjectSettings from './ProjectSettings';
import MemberProfile from './MemberProfile';
import MemberNotification from './MemberNotification';
import User from './User';
import { Switch, Route, Redirect } from 'react-router-dom';


export default () => {
  return (
    <Switch>
      <Redirect from="/settings" exact to="/settings/profile/profile" />
      <Route path="/settings/profile/profile" component={MemberProfile} />
      <Route path="/settings/profile/notifications" component={MemberNotification} />
      <Route path="/settings/project/profile" component={ProjectProfile} />
      <Route path="/settings/project/custom_fields" component={ProjectSettings} />
      <Route exact path='/settings/project/members' component={Members} />
      <Route path="/settings/project/members/:id" component={User} />
    </Switch>
  )
}
