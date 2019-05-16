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
  oldLimit: false,
  hideRehearsals: true
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
    if (
      oldState.offset !== this.state.offset ||
      oldState.hideRehearsals !== this.state.hideRehearsals
    ) {
      this.updateData();
    }
  }

  updateData = async () => {
    const { currentUser } = this.props;
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
    if (this.state.hideRehearsals) {
      params.type = 'Gig';
    }
    const [{ data: gigs, total: count }, availability, { total }] = await Promise.all([
      emit('find', 'gigs', params),
      emit('find', 'gig-availability', { member: currentUser.memberId }),
      emit('find', 'gigs', { ...params, start: { [upcoming ? '$lt' : '$gt']: now }, $limit: 0 }),
    ]);
    this.setState({
      [`${upcoming ? 'new' : 'old'}Limit`]: (count <= $skip + this.state.limit),
      [`${upcoming ? 'old' : 'new'}Limit`]: (total - count) === 0
    })
    this.props.loadGigs(upcoming ? gigs : gigs.reverse());
    this.props.loadUserAvailability(availability);
  }

  renderGigItem = ({ type = 'Gig', _id, start, name }) => {
    const { currentGig, userAvailability, currentUser, classes, handleDrawerToggle } = this.props;
    const date = moment(start).format('MM/DD');
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
        <Grid container>
          <Grid item xs>
            <div style={{ textAlign: 'center', display: 'inline-block' }}>
              <b>{date}</b>
              <br />
              <Typography variant="caption" style={{ fontSize: '60%' }}>
                {type}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={9}>
            <MUILink
              component='span'
            >
              {name}
            </MUILink><br />
            <UserAvailability
              memberId={currentUser.memberId}
              gigId={_id} availability={userAvailability[_id]}
            />
          </Grid>
        </Grid>
        {/* <ListItemText
          primaryTypographyProps={{ className: classes.title }}
          secondaryTypographyProps={{ component: 'div' }}
          primary={
          }
          secondary={
        } /> */}
      </ListItem>
    );
  }

  render() {
    const { gigsList, currentGig } = this.props;
    return (
      <div class='gigList'>
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
                checked={this.state.hideRehearsals}
                onClick={() => { this.setState({ hideRehearsals: !this.state.hideRehearsals, offset: 0 }) }}
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
            to={`/gigs/new`}
          >New Gig</Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            component={Link}
            to={`/rehearsals/new`}
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

export default connect(
  state => ((({ gigsList, currentGig, currentUser, userAvailability }) => ({ gigsList, currentGig, currentUser, userAvailability }))(state)),
  { loadGigs: actions.loadGigs, loadUserAvailability: actions.loadUserAvailability }
)(withStyles(styles)(GigList));
