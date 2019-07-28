import React from 'react';
import Members from './Members';
import ProjectProfile from './ProjectProfile';
import ProjectSettings from './ProjectSettings';
import MemberProfile from './MemberProfile';
import MemberNotification from './MemberNotification';
import ProjectRehearsalSettings from './ProjectRehearsalSettings';
import ProjectCommunication from './ProjectCommunication';
import User from './User';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { startCase } from 'lodash';

export default (props) => {
  const title = startCase(props.match.params.setting);
  return (<>
    <Helmet>
      <title>{`Giggity - Settings - ${title}`}</title>
    </Helmet>
    <Typography variant="h4" gutterBottom>{title}</Typography>
    <Switch>
      <Redirect from="/settings" exact to="/settings/profile/profile" />
      <Route path="/settings/profile/profile" component={MemberProfile} />
      <Route path="/settings/profile/notifications" component={MemberNotification} />
      <Route path="/settings/project/profile" component={ProjectProfile} />
      <Route path="/settings/project/custom_fields" component={ProjectSettings} />
      <Route exact path='/settings/project/members' component={Members} />
      <Route path="/settings/project/members/:id" component={User} />
      <Route path="/settings/project/rehearsals" component={ProjectRehearsalSettings} />
      <Route path="/settings/project/communication" component={ProjectCommunication} />
    </Switch>
  </>)
}
