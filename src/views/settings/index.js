import React from 'react';
import Members from './Members';
import ProjectProfile from './ProjectProfile';
import ProjectSettings from './ProjectSettings';
import User from './User';
import { Switch, Route } from 'react-router-dom';


export default () => {
  return (
    <Switch>
      <Route path="/settings/project/profile" component={ProjectProfile} />
      <Route path="/settings/project/custom_fields" component={ProjectSettings} />
      <Route exact path='/settings/project/members' component={Members} />
      <Route path="/settings/project/members/:id" component={User} />
    </Switch>
  )
}
