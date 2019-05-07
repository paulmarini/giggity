import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Link } from 'react-router-dom'
import {
  IconButton,
  ListItem,
  ListItemText,
  ListItemIcon,
  Icon,
  Link as MUILink
} from '@material-ui/core';
import {
  ChevronRight,
  ChevronLeft
} from '@material-ui/icons';
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

const defaultState = {
  offset: 0,
  limit: 4,
  newLimit: false,
  oldLimit: false,
}

class GigList extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
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

  componentDidUpdate(oldProps, oldState) {
    if (oldState.offset !== this.state.offset) {
      this.updateData();
    }
  }

  updateData = async () => {
    const { currentUser } = this.props;
    const upcoming = this.state.offset >= 0;
    const $skip = Math.abs(upcoming ? this.state.offset : this.state.offset + this.state.limit)
    const params = {
      $limit: this.state.limit,
      start: { [upcoming ? '$gt' : '$lt']: new Date().getTime() },
      $sort: { start: upcoming ? 1 : -1 },
      $select: ['_id', 'name', 'start', 'status'],
      $skip
    }
    const [gigs, availability, count] = await Promise.all([
      emit('find', 'gigs', params),
      emit('find', 'gig-availability', { user: currentUser.memberId }),
      emit('find', 'gigs', { ...params, $limit: 0, $skip: 0 }),
    ]);
    this.state[`${upcoming ? 'new' : 'old'}Limit`] = (count.total < Math.abs(this.state.offset) + this.state.limit)
    this.props.loadGigs(upcoming ? gigs.data : gigs.data.reverse());
    this.props.loadUserAvailability(availability);
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
        <ListItem>
          <IconButton
            onClick={() => this.setState({ offset: this.state.offset - this.state.limit })}
            disabled={this.state.oldLimit}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => this.setState({ offset: this.state.offset + this.state.limit })}
            disabled={this.state.newLimit}
          >
            <ChevronRight />
          </IconButton>
        </ListItem>
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
