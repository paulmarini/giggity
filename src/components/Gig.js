import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../store';
import { Button } from '@material-ui/core';
import { Typography, Grid } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { Helmet } from 'react-helmet';
import { Formik, Form, Field } from 'formik';
import UserAvailability from './UserAvailability';
import UITextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, ListSubheader, Paper, Link as MUILink } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { emit } from '../socket'

const date = new Date().toJSON().slice(0, 10);

const defaultState = {
  name: '',
  description: '',
  date,
  _id: null,
  users: [],
  tab: 'details'
}

class Gig extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.saveGig = this.saveGig.bind(this);
    this.deleteGig = this.deleteGig.bind(this);
    this.state.gigFilter = '';
  };
  componentDidMount() {
    this.updateGig();
  };

  componentDidUpdate(prevProps) {
    const { id } = this.props.match.params;
    const { currentGig } = this.props;
    if (id !== prevProps.match.params.id) {
      this.updateGig();
    } else if (currentGig._id && currentGig._id !== this.state._id && id) {
      this.setState(currentGig);
      if (this.props.drawerOpen) {
        this.props.updateDrawer(false);
      }
    }
  };

  componentWillUnmount() {
    this.props.loadGig({});
    this.props.loadGigAvailability([]);
  }

  updateGig() {
    const { id } = this.props.match.params;
    if (id) {
      emit('get', 'gigs', id)
        .then(message => {
          this.props.loadGig(message);
        })
      emit('find', 'gig-availability', { gig: id })
        .then(availability => {
          this.props.loadGigAvailability(availability.data)
        })
    } else {
      this.setState(defaultState);
      this.props.loadGig(defaultState);
    }
  };

  saveGig(values, formikBag) {
    const { id } = this.props.match.params;
    return (id ?
      emit('patch', 'gigs', id, values) :
      emit('create', 'gigs', values)
    )
      .finally(() => {
        formikBag.setSubmitting(false);
      })
  };

  deleteGig() {
    const { id } = this.props.match.params;
    return emit('remove', 'gigs', id)
      .then(() => {
        this.props.history.push(`/`);
      })
  }

  changeTab = (event, tab) => {
    this.setState({ tab });
  }

  renderDetails() {
    return (
      <Formik onSubmit={this.saveGig} initialValues={this.state} enableReinitialize={true} >
        {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
          <Form>
            <Grid item xs={12} lg={6}>
              <Field
                fullWidth
                name="name"
                label="Name"
                data-validators="isRequired"
                component={TextField}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Field
                fullWidth
                name="date"
                label="Date"
                type="date"
                component={TextField}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Field
                fullWidth
                name="description"
                label="Description"
                multiline
                helperText="yeay"
                placeholder="tekk ne"
                data-validators="isRequired"
                component={TextField}
              />
            </Grid>
            <Grid item xs={12} lg={6} align="center">
              <Button variant="contained" type="submit" color="primary">
                Save Gig
              </Button>
              <Button variant="contained" onClick={this.deleteGig} color="secondary">
                Delete Gig
              </Button>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }

  renderFilter() {
    return <ListSubheader>
      Filter
      <ListItemText
        primary={
          <UITextField name='name-filter' value={this.state.nameFilter} label="Name" />
        }
      />
      <ListItemSecondaryAction>
        <UserAvailability />
      </ListItemSecondaryAction>
    </ListSubheader>
  }

  renderAvailbility() {
    const { id } = this.props.match.params;
    const { users, currentGigAvailability } = this.props;

    if (id) {
      return (
        <List subheader={this.renderFilter()}>
          {
            users.map(user => {
              return (
                <ListItem
                  divider
                  key={user._id}
                >
                  <ListItemText
                    primary={user.name}
                  />
                  <ListItemSecondaryAction>
                    <UserAvailability
                      buttons
                      userId={user._id}
                      gigId={id} availability={currentGigAvailability[user._id]}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })
          }
        </List>
      )
    }
  }

  render() {
    const { id } = this.props.match.params;
    const { currentGig } = this.props;
    const { tab } = this.state;
    return (
      <div>
        <Helmet>
          <title>{`Giggity - ${currentGig.name}`}</title>
        </Helmet>
        {id ?
          <Typography
            variant='h4'
            gutterBottom
            align="center"
          >
            {currentGig.name}
          </Typography>
          : null}
        <Tabs value={tab} onChange={this.changeTab} variant="fullWidth">
          <Tab value='details' label="Details" />
          <Tab value='availability' label="availability" />
        </Tabs>

        <Grid container justify="center" alignItems="center">
          <Grid item xs={12} lg={6}>
            {tab === 'details' && this.renderDetails()}
            {tab === 'availability' && this.renderAvailbility()}
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default connect(
  state => ((({ users, currentGig, currentGigAvailability, drawerOpen }) => ({ users, currentGig, currentGigAvailability, drawerOpen }))(state)),
  {
    loadGig: actions.loadGig,
    loadGigAvailability: actions.loadGigAvailability,
    updateAvailability: actions.updateAvailability,
    updateDrawer: actions.updateDrawer
  }
)(Gig);
