import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../store';
import { Link } from 'react-router-dom'
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Link as MUILink } from '@material-ui/core';
import UserAvailability from './UserAvailability';
import { gigService, userService, emit } from '../socket'
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

const styles = theme => ({
  toolbar: theme.mixins.toolbar,
  modal: {
    zIndex: theme.zIndex.modal - 2
  },
  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  selected: {
    backgroundColor: 'pink'
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
    emit('find', 'gigs')
      .then(gigs => this.props.loadGigs(gigs.data));

    emit('find', 'gig-availability', { user: currentUser.userId })
      .then(res => this.props.loadUserAvailability(res.data));
  }

  renderContents() {
    const { gigsList, currentGig, userAvailability, currentUser, classes } = this.props;
    return (
      <List style={{ width: this.props.width }}>
        <ListItem
          button
          component={Link}
          to={`/gigs/new`}
          selected={currentGig._id === null}
        >
          <ListItemText primary="New Gig!" />
        </ListItem>
        {
          gigsList.map(gig => {
            return (
              <ListItem
                button
                divider
                key={gig._id}
                component={Link}
                selected={currentGig._id === gig._id}
                to={`/gigs/${gig._id}`}
                alignItems="flex-start"
                classes={{
                  selected: classes.selected
                }}
              >
                <ListItemIcon>
                  <b>
                    {moment(gig.date).format('MM/DD')}
                  </b>
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
                      userId={currentUser.userId}
                      gigId={gig._id} availability={userAvailability[gig._id]}
                    />
                  } />
              </ListItem>
            );
          })
        }
      </List>
    );
  }

  render() {
    const { width, classes, drawerOpen, drawerWidth } = this.props;
    return (
      <Drawer
        anchor="left"
        className='gig-list'
        variant={width === 'xs' ? 'temporary' : 'permanent'}
        open={width !== 'xs' || drawerOpen}
        classes={{ modal: classes.modal }}
        PaperProps={{
          style: {
            width: drawerWidth
          }
        }}
      >
        <div className={classes.toolbar} />
        {this.renderContents()}
      </Drawer>
    )
  }
}

export default connect(
  state => ((({ gigsList, currentGig, currentUser, userAvailability, drawerOpen }) => ({ gigsList, currentGig, currentUser, userAvailability, drawerOpen }))(state)),
  { loadGigs: actions.loadGigs, loadUserAvailability: actions.loadUserAvailability }
)(withStyles(styles)(GigList));
