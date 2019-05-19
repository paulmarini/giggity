import React from 'react';
import {
  Grid,
  Typography,
  Link
} from '@material-ui/core';
import moment from 'moment'

class GigSummary extends React.Component {

  constructor(props) {
    super(props);
  }

  renderDate = date => date ? moment(date).format('dddd, MMMM Do') : ''
  renderTime = time => time ? moment(time).format('h:mm A') : ''

  renderRows(rows) {
    return <div className='summary-rows'>
      {
        rows.filter(field => field && field.label)
          .map(({ label, value, showBlank }) => {
            if (!value && !showBlank) {
              return null;
            }
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
    </div>
  }

  customRows(isPublic) {
    const { gigValues, type, customFields } = this.props;
    if (type !== 'Gig') {
      return [];
    }
    return customFields
      .filter(field => Boolean(field.public) === isPublic)
      .map(field => {
        let value = gigValues.custom_fields[field.label];
        if (field.type === 'Link' && value) {
          value = <Link href={value} target="_blank">{value}</Link>
        }
        return {
          label: field.label,
          value
        }
      })
  }

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
        value: gigValues.description || "TBD"
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
          }),
        showBlank: true
      },
      ...(type === 'Gig' ? customFields
        .filter(field => !field.public)
        .map(field => {
          return { label: field.label, value: gigValues.custom_fields[field.label] }
        }) : [])
    ];

    const public_rows = [
      gigValues.event_start && {
        label: 'Event Time',
        value: `${this.renderTime(gigValues.event_start)} -      ${this.renderTime(gigValues.event_end)}`
      },
      {
        label: 'Public Title',
        value: gigValues.public_title,
      },
      {
        label: 'Public Description',
        value: gigValues.public_description,
      },
      {
        label: 'Public Link',
        value: gigValues.link && <Link href={gigValues.link} target="_blank">{gigValues.link}</Link>,
      },
      ...this.customRows(true)

    ];

    return <div className='summary'>
      {this.renderRows(rows)}
      <hr />
      <Typography gutterBottom variant="h6">Public Details</Typography>
      {this.renderRows(public_rows)}
    </div>
  }
}

export default GigSummary;
