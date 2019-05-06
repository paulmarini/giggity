import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Link } from 'react-router-dom'
import { ListItem, ListItemText, ListItemIcon, Link as MUILink } from '@material-ui/core';
import UserAvailability from '../../components/UserAvailability';
import { gigService, userService, emit } from '../../socket'
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

const styles = theme => ({
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});

class GigList extends Component {
  constructor(props) {
    super(props);
    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    userService.on('patched', this.updateData);
    gigService.on('created', this.updateData);
    gigService.on('removed', this.updateData);
    this.updateData();
  }

  componentWillUnmount() {
    userService.removeListener('patched', this.updateData);
    gigService.removeListener('created', this.updateData);
    gigService.removeListener('removed', this.updateData);
  }

  updateData() {
    const { currentUser } = this.props;
    emit('find', 'gigs', { $limit: 10, $sort: { start: 1 } })
      .then(gigs => this.props.loadGigs(gigs));

    emit('find', 'gig-availability', { user: currentUser.memberId })
      .then(res => this.props.loadUserAvailability(res));
  }

  renderGigItem = (gig) => {
    const { currentGig, userAvailability, currentUser, classes, handleDrawerToggle } = this.props;
    const date = moment(gig.start).format('MM/DD');
    return (
      <ListItem
        button
        divider
        key={gig._id}
        component={Link}
        selected={currentGig._id === gig._id}
        to={`/gigs/${gig._id}`}
        alignItems="flex-start"
        onClick={handleDrawerToggle}
      >
        <ListItemIcon>
          <b>{date}</b>
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ className: classes.title }}
          secondaryTypographyProps={{ component: 'div' }}
          primary={
            <MUILink
              component='span'
            >
              {gig.name}
            </MUILink>
          }
          secondary={
            <UserAvailability
              memberId={currentUser.memberId}
              gigId={gig._id} availability={userAvailability[gig._id]}
            />
          } />
      </ListItem>
    );
  }

  render() {
    const { gigsList, currentGig } = this.props;
    return (
      <>
        <ListItem
          button
          component={Link}
          to={`/gigs/new`}
          selected={currentGig._id === null}
        >
          <ListItemText primary="New Gig!" />
        </ListItem>
        {
          gigsList.map(this.renderGigItem)
        }
      </>
    );
  }
}

export default connect(
  state => ((({ gigsList, currentGig, currentUser, userAvailability }) => ({ gigsList, currentGig, currentUser, userAvailability }))(state)),
  { loadGigs: actions.loadGigs, loadUserAvailability: actions.loadUserAvailability }
)(withStyles(styles)(GigList));
