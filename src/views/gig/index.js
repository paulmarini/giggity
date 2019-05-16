import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Typography, Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { emit } from '../../socket'
import moment from 'moment'
import { get, set, merge } from 'lodash';
import GigDetails from './GigDetails';
import PublicDetails from './PublicDetails';
import GigAvailability from './GigAvailability';

const formatDate = date => moment(date || new Date()).format('YYYY-MM-DD')
const formatTime = date => moment(date || new Date()).format('HH:mm')

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
    this.timeFields = ['start', 'end', 'load_in', 'event_start', 'event_end'];

    this.defaultGig = {
      name: '',
      status: 'Proposed',
      description: '',
      date: formatDate()
    };
    const { currentProject: { custom_fields = [], rehearsal_defaults = {} } } = this.props;
    custom_fields.map((field) => {
      set(this.defaultGig, `custom_fields.${field.label}`, get(this.defaultGig, `custom_fields.${field.label}`) || field.default || "");
    });
    this.defaultRehearsal = {
      ...rehearsal_defaults,
      date: formatDate(),
      startTime: formatTime(rehearsal_defaults.start),
      endTime: formatTime(rehearsal_defaults.end),
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
      this.props.loadGig(this[`default${this.checkType()}`]);
    }
  };

  saveGig(values) {
    const { id } = this.props.match.params;
    const gig = { ...values };
    const start = moment(gig.startTime, 'HH:mm');
    const gigdate = moment(gig.date, 'YYYY-MM-DD');
    this.timeFields.forEach(field => {
      if (!gig[`${field}Time`] && field !== 'start') {
        gig[field] = '';
      } else if (gig[`${field}Time`] !== undefined || field === 'start') {
        const time =  moment(gig[`${field}Time`], 'HH:mm')
        const date = time < start ? gigdate : gigdate.add(1, 'd'); 
        
        gig[field] = date
          .set({
            hour: time.get('hour'),
            minute: time.get('minute'),
          }).toISOString()
      }
    })
    delete gig._id;
    delete gig.date;
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

  formatGigValues() {
    const { currentGig, currentProject: {custom_fields} } = this.props;
    if (this.checkNewGig()) {
      return this[`default${this.checkType()}`];
    }
    const date = moment(currentGig.start || new Date()).format('YYYY-MM-DD');
    const gigValues = merge({date}, this[`default${this.checkType()}`], currentGig, {date});
    
    this.timeFields.forEach(field => {
      if (field === 'start' && !currentGig.end) {
        gigValues.startTime = '';
      } else {
        gigValues[`${field}Time`] = currentGig[field] ? formatTime(currentGig[field]) : '';
      }

    });
    if (gigValues.startTime && !gigValues.load_inTime) {
      gigValues.load_inTime = gigValues.startTime;
    }
    return gigValues;
  }



  render() {
    const { id } = this.props.match.params;
    const { users, currentGigAvailability, currentGig, nextGigId, currentProject: {custom_fields} } = this.props;
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
    const values = this.formatGigValues();
    const title =  !this.checkNewGig() ? currentGig.name : `New ${this.checkType()}`;

    return (
      <div>
        <Helmet>
          <title>{`Giggity - ${title}`}</title>
        </Helmet>
        <Typography
          variant='h4'
          gutterBottom
          align="center"
        >
          { title }
        </Typography>
        <Tabs value={tab} onChange={this.changeTab} variant="fullWidth">
          <Tab value='details' label="Details" />
          {
            this.checkType() === 'Gig' && <Tab value='public' label="Public Details" />
          }
          { 
            !this.checkNewGig() &&
            <Tab value='availability' label="Availability" />
          }
        </Tabs>

        <Grid container justify="center" alignItems="center">
          <Grid item xs={12} lg={6}>
            {tab === 'details' && 
              <GigDetails
                customFields={custom_fields}
                gigValues={values}
                type={this.checkType()}
                saveGig={this.saveGig}
                deleteGig={this.deleteGig}
              />
            }
            {tab === 'availability' && !this.checkNewGig() &&
              <GigAvailability
                {...{users, currentGigAvailability, id}}
              />
            }
            {tab === 'public' && 
              <PublicDetails
                customFields={custom_fields}
                gigValues={values}
                saveGig={this.saveGig}
                deleteGig={this.deleteGig}
              />
            }
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
