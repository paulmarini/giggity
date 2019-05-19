import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Link } from 'react-router-dom'
import {
  IconButton,
  Button,
  List,
  ListItem,
  Grid,
  Typography,
  Checkbox,
  Link as MUILink,
  FormControlLabel
} from '@material-ui/core';
import {
  ChevronRight,
  ChevronLeft,
  Edit,
  Check,
  NotInterested,
  HelpOutline
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
  limit: 10,
  newLimit: false,
  oldLimit: false
}

const statusIcons = {
  Confirmed: Check,
  Proposed: HelpOutline,
  Cancelled: NotInterested,
  Draft: Edit,
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
    gigService.on('patched', this.updateData);
    this.updateData();
  }

  componentWillUnmount() {
    userService.removeListener('patched', this.updateData);
    gigService.removeListener('created', this.updateData);
    gigService.removeListener('removed', this.updateData);
  }

  componentDidUpdate(oldProps, oldState) {
    if (
      oldState.offset !== this.state.offset ||
      oldProps.hide_rehearsals !== this.props.hide_rehearsals
    ) {
      this.updateData();
    }
  }

  handleRehearsalToggle = async () => {
    const { hide_rehearsals, member_id } = this.props;
    await emit('patch', 'members', member_id, { 'preferences.hide_rehearsals': !hide_rehearsals })
    this.setState({ offset: 0 });
  }

  updateData = async () => {
    const { hide_rehearsals, member_id, role_index } = this.props;
    const upcoming = this.state.offset >= 0;
    const $skip = Math.abs(upcoming ? this.state.offset : this.state.offset + this.state.limit);
    const now = new Date().getTime();
    const params = {
      $limit: this.state.limit,
      start: { [upcoming ? '$gt' : '$lt']: now },
      $sort: { start: upcoming ? 1 : -1 },
      $select: ['_id', 'name', 'start', 'status', 'type'],
      $skip
    }
    if (hide_rehearsals) {
      params.type = 'Gig';
    }
    if (role_index > 2) {
      params.status = { $ne: 'Draft' };
    }
    const [{ data: gigs, total: count }, availability, { total }] = await Promise.all([
      emit('find', 'gigs', params),
      emit('find', 'gig-availability', { member: member_id }),
      emit('find', 'gigs', { ...params, start: { [upcoming ? '$lt' : '$gt']: now }, $limit: 0 }),
    ]);
    this.setState({
      [`${upcoming ? 'new' : 'old'}Limit`]: (count <= $skip + this.state.limit),
      [`${upcoming ? 'old' : 'new'}Limit`]: (total - count) === 0
    })
    this.props.loadGigs(upcoming ? gigs : gigs.reverse());
    this.props.loadUserAvailability(availability);
  }

  renderGigItem = ({ type = 'Gig', _id, start, name, status }) => {
    const { currentGig, userAvailability, member_id, handleDrawerToggle } = this.props;
    const date = moment(start).format('MM/DD');
    const StatusIcon = statusIcons[status] || HelpOutline;
    return (
      <ListItem
        button
        divider
        key={_id}
        component={Link}
        selected={currentGig._id === _id}
        to={`/${type.toLowerCase()}s/${_id}`}
        alignItems="flex-start"
        onClick={handleDrawerToggle}
      >
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography variant="caption" align="center" style={{ fontSize: '60%' }}>
              < StatusIcon size="small"></ StatusIcon>
              <br />
              {type}
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography align="center" variant="body2">
              <b>{date}</b>
              <br />
              {moment(start).format('ddd')}
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Typography variant="body1">
              <MUILink
                component='span'
              >
                {name}
              </MUILink>
            </Typography>
            {
              status !== 'Cancelled' &&
              <UserAvailability
                member_id={member_id}
                gigId={_id} availability={userAvailability[_id]}
              />

            }
          </Grid>
        </Grid>
      </ListItem>
    );
  }

  render() {
    const { gigsList, currentGig, hide_rehearsals } = this.props;
    return (
      <div className='gigList'>
        <div>
          <IconButton
            onClick={() => this.setState({ offset: this.state.offset - this.state.limit })}
            disabled={this.state.oldLimit}
          >
            <ChevronLeft />
          </IconButton>
          <FormControlLabel
            fontSize={"small"}
            control={
              <Checkbox
                checked={hide_rehearsals}
                onClick={this.handleRehearsalToggle}
                color="primary"
                fontSize={"small"}
              />
            }
            label="Hide Rehearsals"
          />
          <IconButton
            variant="fab"
            onClick={() => this.setState({ offset: this.state.offset + this.state.limit })}
            disabled={this.state.newLimit}
          >
            <ChevronRight />
          </IconButton>
        </div>

        <div
          selected={currentGig._id === null}
        >
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component={Link}
            to={`/gigs/new/details`}
          >New Gig</Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component={Link}
            to={`/rehearsals/new/details`}
          >New Rehearsal</Button>

        </div>
        <List>
          {
            gigsList.map(this.renderGigItem)
          }
        </List>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  gigsList: state.gigsList,
  currentGig: state.currentGig,
  member_id: state.currentUser.member_id,
  role_index: state.currentUser.role_index,
  hide_rehearsals: state.currentUser.preferences.hide_rehearsals,
  userAvailability: state.userAvailability
})

const mapDispatchToProps = {
  loadGigs: actions.loadGigs,
  loadUserAvailability: actions.loadUserAvailability
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(GigList));
