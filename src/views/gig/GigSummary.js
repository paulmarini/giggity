import React from 'react';
import {
  Grid,
  Typography
} from '@material-ui/core';
import moment from 'moment'

class GigSummary extends React.Component {

  constructor(props) {
    super(props);
  }

  renderDate = date => date ? moment(date).format('dddd, MMMM Do') : ''
  renderTime = time => time ? moment(time).format('h:mm A') : ''

  render() {
    const { gigValues, type, availabilityIndex, customFields } = this.props;
    const rows = [
      {
        label: 'When',
        value: <>
          {this.renderDate(gigValues.date)}
          {
            gigValues.startTime &&
            ` from ${this.renderTime(gigValues.start)} -      ${this.renderTime(gigValues.end)}`
          } < br />
          {gigValues.load_in && type === 'Gig' &&
            `Load-in at ${this.renderTime(gigValues.load_in)}`
          }
        </>
      },
      {
        label: 'Where',
        value: gigValues.location || 'TBD'
      },
      type === 'Gig' && {
        label: 'Description',
        value: gigValues.description
      },
      {
        label: 'Who\'s Coming',
        value: ['Available', 'Maybe', 'Unavailable']
          .filter(key => availabilityIndex[key] && availabilityIndex[key].length)
          .map(key => {
            return <span key={key}>
              <b>{key}</b>: {availabilityIndex[key].map(user => user.name).join(', ')}

              <br />
            </span>
          })
      },
      ...(type === 'Gig' ? customFields.map(field => {
        return { label: field.label, value: gigValues.custom_fields[field.label] }
      }) : [])
    ]
    return rows
      .filter(({ label }) => label)
      .map(({ label, value }) => {
        return (
          <Grid key={label} container spacing={16} className='gig-summary'>
            <Grid xs={4} item className='info-label'>
              <Typography align="right" variant="body1">
                {label}
              </Typography>
            </Grid>
            <Grid xs={8} item className='info-data'>
              <Typography variant="body1">
                {value}
              </Typography>
            </Grid>
          </Grid>
        )
      })
  }
}

export default GigSummary;
