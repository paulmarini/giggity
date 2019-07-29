import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';
import { Typography, Grid } from '@material-ui/core';
import { Redirect, Link, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { emit } from '../../socket'
import moment from 'moment'
import { get, set, merge, startCase } from 'lodash-es';
import GigDetails from './GigDetails';
import GigAvailability from './GigAvailability';
import GigSummary from './GigSummary';
import { isUserOrRole } from '../../util';
import './index.scss';

const formatDate = date => moment(date || new Date()).format('YYYY-MM-DD')
const formatTime = date => moment(date || new Date()).format('HH:mm')

const defaultState = {
  isLoading: true
}

class Gig extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.saveGig = this.saveGig.bind(this);
    this.deleteGig = this.deleteGig.bind(this);
    this.timeFields = ['start', 'end', 'load_in', 'event_start', 'event_end'];

    this.defaultGig = {
      name: '',
      status: 'Draft',
      description: '',
      date: formatDate(),
      private: true
    };
    const { currentProject: { custom_fields = [], rehearsal_defaults = {} } } = this.props;
    custom_fields.forEach((field) => {
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
    }
  };

  componentWillUnmount() {
    this.props.loadGig({});
    this.props.loadGigAvailability([]);
  }

  checkType = () => this.props.match.path.split("/")[1] === "rehearsals" ? 'Rehearsal' : 'Gig';

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
      this.setState({ isLoading: false })
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
        const time = moment(gig[`${field}Time`], 'HH:mm');
        const date = time && start && time.isBefore(start) ? gigdate.add(1, 'd') : gigdate;

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
    const { currentGig } = this.props;
    if (this.checkNewGig()) {
      return this[`default${this.checkType()}`];
    }
    const date = moment(currentGig.start || new Date()).format('YYYY-MM-DD');
    const gigValues = merge({ date }, this[`default${this.checkType()}`], currentGig, { date });

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
    const { users, currentGigAvailability, currentGig, nextGigId, currentProject: { custom_fields }, match, member_id } = this.props;
    const { id } = match.params;
    const type = this.checkType();
    const availabilityIndex = Object.values(currentGigAvailability)
      .reduce((index, availability) => {
        index[availability.status] = index[availability.status] || []
        index[availability.status].push({ user: users[availability.member], availability })
        return index;
      }, {})

    const isNewGig = this.checkNewGig();
    const isManager = isUserOrRole({ role: 'Manager' });

    if (!id) {
      if (nextGigId) {
        return <Redirect to={`/${type.toLowerCase()}s/${nextGigId}/summary`} />
      }
      return "No Upcoming Gigs";
    }
    if (!match.params.view) {
      return <Redirect to={`/${type.toLowerCase()}s/${id}/summary`} />
    }
    if (this.state.isLoading) {
      return "..."
    }
    const values = this.formatGigValues();
    const title = !isNewGig ? currentGig.name : `New ${type}`;
    return (
      <div className={`gig ${type}-gig`}>
        <Helmet>
          <title>{`Giggity - ${title}`}</title>
        </Helmet>
        <Typography
          variant='h4'
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          variant='h6'
          gutterBottom
          color="textSecondary"
        >
          {currentGig.start && moment(currentGig.start).format('dddd, MMMM Do, YYYY')}<br />
          {currentGig.status}
        </Typography>

        <Tabs
          value={match.params.view}
          onChange={this.changeTab}
          variant="scrollable"
          scrollButtons="auto"
        >
          {
            [
              !isNewGig && 'summary',
              isManager && 'details',
              isManager && type === 'Gig' && 'public_details',
              !isNewGig && 'availability'
            ]
              .map(tab => tab &&
                <Tab
                  key={tab}
                  value={tab}
                  label={startCase(tab)}
                  to={tab}
                  component={Link}
                />
              )
          }
        </Tabs>

        <Grid container justify="center" alignItems="center" className="gig-content">
          <Grid item xs={12} lg={6}>
            <Switch>
              <Route path={`${match.path}/summary`}>
                <GigSummary
                  customFields={custom_fields}
                  gigValues={values}
                  availabilityIndex={availabilityIndex}
                  userAvailability={currentGigAvailability[member_id]}
                  type={type}
                  id={id}
                  member_id={member_id}
                />
              </Route>
              <Route path={[`${match.path}/details`, `${match.path}/public_details`]}>
                <GigDetails
                  customFields={custom_fields}
                  gigValues={values}
                  type={type}
                  saveGig={this.saveGig}
                  deleteGig={this.deleteGig}
                  mode={match.params.view}
                />
              </Route>
              <Route path={`${match.path}/availability`}>
                <GigAvailability
                  users={users}
                  currentGigAvailability={currentGigAvailability}
                  id={id}
                />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </div >
    );
  }
}

const mapStateToProps = state => ({
  users: state.users,
  currentGig: state.currentGig,
  currentGigAvailability: state.currentGigAvailability,
  drawerOpen: state.drawerOpen,
  currentProject: state.currentProject,
  nextGigId: state.nextGigId,
  member_id: state.currentUser.member_id
});

const mapDispatchToProps = {
  loadGig: actions.loadGig,
  loadGigAvailability: actions.loadGigAvailability,
  updateDrawer: actions.updateDrawer
};

export default connect(mapStateToProps, mapDispatchToProps)(Gig);
