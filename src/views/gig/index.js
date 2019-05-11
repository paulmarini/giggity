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
  tab: 'details',
  isLoading: true
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
    this.defaultRehearsal = {
      ...this.props.currentProject.rehearsal_defaults,
      start: formatDate(this.props.currentProject.rehearsal_defaults.start),
      end: formatDate(this.props.currentProject.rehearsal_defaults.end),
      description: ''
    };
    this.state.isLoading = !this.checkNewGig();
  };

  componentDidMount() {
    this.updateGig();
  };

  componentDidUpdate(prevProps) {
    const { params: { id } } = this.props.match;

    if (id !== prevProps.match.params.id) {
      this.updateGig();
      if (this.props.drawerOpen) {
        this.props.updateDrawer(false);
      }
    }
  };

  componentWillUnmount() {
    this.props.loadGig({});
    this.props.loadGigAvailability([]);
  }

  checkType = () => this.props.match.path === "/rehearsals/:id?" ? 'Rehearsal' : 'Gig';

  checkNewGig = () => this.props.match.params.id === 'new'

  updateGig = async () => {
    const { id } = this.props.match.params;
    if (!id) { return; }

    if (!this.checkNewGig()) {
      this.setState({ isLoading: true })
      try {
        const [message, availability] = await Promise.all([
          emit('get', 'gigs', id),
          emit('find', 'gig-availability', { gig: id })
        ])
        this.props.loadGig(message);
        this.props.loadGigAvailability(availability)
      } finally {
        this.setState({ isLoading: false })
      }
    } else {
      // this.setState(defaultState);
      this.props.loadGig(this[`default${this.checkType()}`]);
    }
  };

  saveGig(values) {
    const { id } = this.props.match.params;
    const gig = { ...values };
    this.dateFields.forEach(field => {
      if (gig[field]) {
        gig[field] = moment(gig[field], 'YYYY-MM-DDTHH:mm').toISOString()
      }
    })
    delete gig._id;
    gig.type = this.checkType();
    return (!this.checkNewGig() ?
      emit('patch', 'gigs', id, gig) :
      emit('create', 'gigs', gig)
    )
      .then(gig => {
        if (this.checkNewGig()) {
          this.props.history.push(`/${this.checkType().toLowerCase()}s/${gig._id}`);
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
    const gig = merge({}, this[`default${this.checkType()}`], currentGig);

    this.dateFields.forEach(field => {
      gig[field] = formatDate(currentGig[field])
    })

    const custom_fields = (currentProject.custom_fields || []).map((field) => {
      set(gig, `custom_fields.${field.label}`, get(gig, `custom_fields.${field.label}`) || field.default || "");
      return { ...field, name: `custom_fields.${field.label}` }
    });

    const fields = {
      Gig: [
        { type: 'Radio', label: 'Status', name: 'status', options: ['Proposed', 'Confirmed', 'Canceled'] },
        { type: 'Text', label: 'Name', name: 'name' },
        { type: 'DateTime', label: 'Start Time', name: 'start' },
        { type: 'DateTime', label: 'End Time', name: 'end' },
        { type: 'Text', label: 'Location', name: 'location' },
        { type: 'Paragraph', label: 'Description', name: 'description' },
        { type: 'DateTime', label: 'Load In', name: 'load_in' },

        ...custom_fields
      ],
      Rehearsal: [
        { type: 'Text', label: 'Name', name: 'name' },
        { type: 'DateTime', label: 'Start Time', name: 'start' },
        { type: 'DateTime', label: 'End Time', name: 'end' },
        { type: 'Text', label: 'Location', name: 'location' },
        { type: 'Paragraph', label: 'Description', name: 'description' },
      ]
    };
    // const fields = this.checkType() === 'Gig' ? gigFields : rehearsalFields;
    // console.log(this.checkType(), fields[this.checkType()]);
    const deleteButton = <Button variant="outlined" onClick={this.deleteGig}>
      Delete Gig
    </Button>

    return (
      <GiggityForm
        onSubmit={this.saveGig}
        initialValues={!this.checkNewGig() ? gig : this[`default${this.checkType()}`]}
        fields={fields[this.checkType()]}
        buttons={[deleteButton]}
        submitLabel="Save Gig"
        validate={this.validate}

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

  validate = values => {
    const errors = {}
    if (values.end <= values.start) {
      errors.end = 'End time must be after start time'
    }
    return errors;
  }

  renderPublic() {
    const { currentGig, currentProject } = this.props;
    const { id } = this.props.match.params;

    const gig = merge({}, this[`default${this.checkType()}`], currentGig);

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
        initialValues={!this.checkNewGig() ? gig : this[`default${this.checkType()}`]}
        fields={fields}
        submitLabel="Save Public Details"
      />
    );
  }

  renderAvailability() {
    const { id } = this.props.match.params;
    const { users, currentGigAvailability } = this.props;
    if (!this.checkNewGig()) {
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
    if (this.state.isLoading) {
      return "..."
    }
    return (
      <div>
        <Helmet>
          <title>{`Giggity - ${currentGig.name}`}</title>
        </Helmet>
        <Typography
          variant='h4'
          gutterBottom
          align="center"
        >
          {!this.checkNewGig() ?
            currentGig.name
            : `New ${this.checkType()}`}
        </Typography>
        <Tabs value={tab} onChange={this.changeTab} variant="fullWidth">
          <Tab value='details' label="Details" />
          {
            this.checkType() === 'Gig' && <Tab value='public' label="Public Details" />
          }
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
