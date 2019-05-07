import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Button } from '@material-ui/core';
import { Typography, Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import UserAvailability from '../../components/UserAvailability';
import UITextField from '@material-ui/core/TextField';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  ListSubheader,
  Paper,
  Link as MUILink
} from '@material-ui/core';
import { emit } from '../../socket'
import moment from 'moment'
import { get, set, merge } from 'lodash';
import GiggityForm from '../../components/Form';

const formatDate = date => moment(date || new Date()).format('YYYY-MM-DDTHH:mm')

const defaultState = {
  _id: null,
  tab: 'details'
}

class Gig extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.saveGig = this.saveGig.bind(this);
    this.deleteGig = this.deleteGig.bind(this);
    this.state.gigFilter = '';
    this.dateFields = ['start', 'end', 'load_in', 'event_start', 'event_end'];
    this.defaultGig = {
      name: '',
      status: 'Proposed',
      description: '',
      start: formatDate(),
      end: formatDate()
    };
    (this.props.currentProject.custom_fields || []).map((field) => {
      set(this.defaultGig, `custom_fields.${field.label}`, get(this.defaultGig, `custom_fields.${field.label}`) || field.default || "");
    });

  };
  componentDidMount() {
    this.updateGig();
  };


  componentDidUpdate(prevProps) {
    const { id } = this.props.match.params;
    const { currentGig } = this.props;
    if (id !== prevProps.match.params.id) {
      this.updateGig();
      if (this.props.drawerOpen) {
        this.props.updateDrawer(false);
      }
      // } else if (currentGig._id && currentGig._id !== id && id) {
      //   // currentGig.start = formatDate(currentGig.start)
      //   // currentGig.end = formatDate(currentGig.end)
      //   // this.setState(currentGig);
      //   if (this.props.drawerOpen) {
      //     this.props.updateDrawer(false);
      //   }
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
          this.props.loadGigAvailability(availability)
        })
    } else {
      this.setState(defaultState);
      this.props.loadGig(defaultState);
    }
  };

  saveGig(values) {
    const { id } = this.props.match.params;
    this.dateFields.forEach(field => {
      values[field] = moment(values[field], 'YYYY-MM-DDTHH:mm').toISOString()
    })
    delete values._id;
    return (id ?
      emit('patch', 'gigs', id, values) :
      emit('create', 'gigs', values)
    )
      .then(gig => {
        if (!id) {
          this.props.history.push(`/gigs/${gig._id}`);
        }
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
    const { currentGig, currentProject } = this.props;
    const { id } = this.props.match.params;
    const gig = merge({}, this.defaultGig, currentGig);

    this.dateFields.forEach(field => {
      gig[field] = formatDate(currentGig[field])
    })

    const custom_fields = (currentProject.custom_fields || []).map((field) => {
      set(gig, `custom_fields.${field.label}`, get(gig, `custom_fields.${field.label}`) || field.default || "");
      return { ...field, name: `custom_fields.${field.label}` }
    });

    const fields = [
      { type: 'Radio', label: 'Status', name: 'status', options: ['Proposed', 'Confirmed', 'Canceled'] },
      { type: 'Text', label: 'Name', name: 'name' },
      { type: 'DateTime', label: 'Start Time', name: 'start' },
      { type: 'DateTime', label: 'End Time', name: 'end' },
      { type: 'Text', label: 'Location', name: 'location' },
      { type: 'Paragraph', label: 'Description', name: 'description' },
      { type: 'DateTime', label: 'Load In', name: 'load_in' },

      ...custom_fields
    ]

    const deleteButton = <Button variant="outlined" onClick={this.deleteGig}>
      Delete Gig
    </Button>

    return (
      <GiggityForm
        onSubmit={this.saveGig}
        initialValues={id ? gig : this.defaultGig}
        fields={fields}
        buttons={[deleteButton]}
        submitLabel="Save Gig"
      />
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

  renderPublic() {
    const { currentGig, currentProject } = this.props;
    const { id } = this.props.match.params;

    const gig = merge({}, this.defaultGig, currentGig);

    this.dateFields.forEach(field => {
      gig[field] = formatDate(currentGig[field])
    })

    const custom_fields = (currentProject.custom_fields || []).map((field) => {
      set(gig, `custom_fields.${field.label}`, get(gig, `custom_fields.${field.label}`) || field.default || "");
      return { ...field, name: `custom_fields.${field.label}` }
    });

    const fields = [
      { type: 'Checkbox', label: 'Private Gig', name: 'private', helperText: 'Private gigs will not be published to the public calendar' },
      { type: 'Text', label: 'Public Title', name: 'public_title' },
      { type: 'Paragraph', label: 'Public Description', name: 'public_description' },
      { type: 'DateTime', label: 'Event Start Time', name: 'event_start' },
      { type: 'DateTime', label: 'Event End Time', name: 'event_end' },
      { type: 'Link', label: 'Public Link', name: 'link' },
      ...custom_fields
    ]

    return (
      <GiggityForm
        onSubmit={this.saveGig}
        initialValues={id ? gig : this.defaultGig}
        fields={fields}
        submitLabel="Save Public Details"
      />
    );
  }

  renderAvailability() {
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
                      memberId={user._id}
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
    const { currentGig, nextGigId } = this.props;
    const { tab } = this.state;

    if (!id) {
      if (nextGigId) {
        return <Redirect to={`/gigs/${nextGigId}`} />
      } else {
        return "No Upcoming Gigs";
      }
    }

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
          <Tab value='public' label="Public Details" />
          <Tab value='availability' label="Availability" />
        </Tabs>

        <Grid container justify="center" alignItems="center">
          <Grid item xs={12} lg={6}>
            {tab === 'details' && this.renderDetails()}
            {tab === 'availability' && this.renderAvailability()}
            {tab === 'public' && this.renderPublic()}
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  users: state.users,
  currentGig: state.currentGig,
  currentGigAvailability: state.currentGigAvailability,
  drawerOpen: state.drawerOpen,
  currentProject: state.currentProject,
  nextGigId: state.nextGigId
});

const mapDispatchToProps = {
  loadGig: actions.loadGig,
  loadGigAvailability: actions.loadGigAvailability,
  updateDrawer: actions.updateDrawer
};

export default connect(mapStateToProps, mapDispatchToProps)(Gig);
