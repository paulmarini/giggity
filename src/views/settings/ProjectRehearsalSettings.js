import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';
import later from 'later';
import {
  Typography,
  List,
  ListItem
} from '@material-ui/core'
import moment from 'moment'
import './ProjectRehearsalSettings.scss'

class ProjectRehearsalSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: []
    };
  }

  componentDidMount() {
    const { currentProject: { rehearsal_schedule = '' } } = this.props;
    this.validateSchedule(rehearsal_schedule)
  }

  submit = id => async ({ start, end, name, location, rehearsal_schedule }) => {
    start = start ? moment(start, 'HH:mm').toISOString() : null;
    end = end ? moment(end, 'HH:mm').toISOString() : null;
    await emit('patch', 'projects', id, { rehearsal_defaults: { start, end, name, location }, rehearsal_schedule });
  }

  validateSchedule = schedule => {
    const sched = later.parse.text(schedule.trim().replace(/\n/g, ' also '));
    console.log(sched)
    if (sched.error === -1) {
      const preview = later.schedule(sched).next(5);
      if (preview && preview.length) {
        this.setState({ preview })
      }
    } else {
      this.setState({ preview: [] })
      return 'Invalid schedule'
    }
  }

  render() {
    const { currentProject: { _id, rehearsal_defaults: { start, end, name, location }, rehearsal_schedule = '' } } = this.props;

    const startTime = start ? moment(start).format('HH:mm') : null;
    const endTime = end ? moment(end).format('HH:mm') : null;

    const fields = [
      <>
        <Typography variant='h5' gutterBottom>Rehearsal Schedule</Typography>
        <Typography variant='body1' gutterBottom>
          Giggity will automatically add rehearsals according to this schedule. Add additional schedules with new lines.
          </Typography>
        <Typography variant='body2'>
          Examples:<br />
          <code>on tuesdays</code> (Every tuesday)<br />
          <code>on wed every 2nd week</code> (Every other wednesday)<br />
          <code>on the 1st day instance on Friday</code> (The first Friday of the month)
        </Typography >
      </>,
      { type: 'Paragraph', label: 'Schedule', name: 'rehearsal_schedule', validate: this.validateSchedule },
      <>
        {this.state.preview.length &&
          <Typography variant='overline' gutterBottom>Preview of next 5 rehearsals according to schedule</Typography>}
        <List className='rehearsal_preview'>
          {
            this.state.preview.map((time, index) =>
              <ListItem divider dense fontSize={9} key={index}>
                {moment.utc(time).format('dddd, MMMM Do')}
              </ListItem>)
          }
        </List>
      </>
      ,
      <Typography variant='h5' gutterBottom>Default Rehearsal Values</Typography>,
      <Typography variant='body1' gutterBottom>
        These settings will be the default values for new rehearsals.
        </Typography>,
      { type: 'Text', label: 'Title', name: 'name' },
      { type: 'Time', label: 'Start', name: 'start' },
      { type: 'Time', label: 'End', name: 'end' },
      { type: 'Text', label: 'Location', name: 'location' }
    ]
    return <>
      <Form
        initialValues={{ start: startTime, end: endTime, name, location, rehearsal_schedule }}
        onSubmit={this.submit(_id)}
        fields={fields}
        submitLabel="Save Rehearsal Settings"
      />
    </>
  };
}


const mapStatetoProps = state => ((({ currentProject }) => ({ currentProject }))(state))

export default connect(mapStatetoProps)(ProjectRehearsalSettings);
