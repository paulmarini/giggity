import React from 'react';
import {
  Grid,
  Typography,
  Link
} from '@material-ui/core';
import UserAvailability from '../../components/UserAvailability';
import GiggityForm from '../../components/Form';
import { emit } from '../../socket'

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
        rows.filter(field => field && field.label && (field.value || field.showBlank))
          .map(({ label, value, showBlank }) => {
            return (
              <Grid key={label} container spacing={16} className='gig-summary'>
                <Grid xs={4} item className='info-label'>
                  <Typography align="right" variant="body1">
                    {label}
                  </Typography>
                </Grid>
                <Grid xs={8} item className='info-data'>
                  <Typography component="div" variant="body1">
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

  updateAvailability = ({ comments }) => {
    const { id, member_id, userAvailability } = this.props;
    if (member_id && id) {
      if (userAvailability) {
        emit('patch', 'gig-availability', userAvailability._id, { member: member_id, gig: id, comments });
      } else {
        emit('create', 'gig-availability', { member: member_id, gig: id, comments, status: 'Unknown' });
      }
    }
  }

  render() {
    const { gigValues, type, userAvailability = {}, availabilityIndex, customFields, id, member_id } = this.props;
    const rows = [
      {
        label: 'Status',
        value: gigValues.status,
      },
      {
        label: 'Your Availability',
        value: <UserAvailability gigId={id} member_id={member_id} availability={userAvailability} />
      },
      {
        label: 'Your Comments',
        value: <GiggityForm
          initialValues={{ comments: userAvailability.comments }}
          fields={[{ type: 'Paragraph', name: 'comments', label: '' }]}
          onSubmit={this.updateAvailability}
          submitLabel="Save"
        />
      },

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
            return <Typography key={key} variant="body2">
              <b>{key}</b>: {availabilityIndex[key].map(({ user }) => user.name).join(', ')}
            </Typography>
          }),
        showBlank: true
      },
      {
        label: 'Member Comments',
        value: Object.values(availabilityIndex)
          .reduce((arr, val) => [...arr, ...val], [])
          .filter(({ availability }) => availability.comments)
          .sort((a, b) => a.user.name.localeCompare(b.user.name))
          .map(({ user, availability }) =>
            <Typography key={availability._id} variant="body2">
              <b>{user.name}</b>: &nbsp;
              {availability.comments}
            </Typography>
          )
      },
      ...(type === 'Gig' ? customFields
        .filter(field => !field.public)
        .map(field => {
          return { label: field.label, value: gigValues.custom_fields[field.label] }
        }) : [])
    ];

    const public_rows = this.renderRows([
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
    ]);

    return <div className='summary'>
      {this.renderRows(rows)}
      {
        Boolean(public_rows.props.children.length) &&
        <>
          <hr />
          <Typography gutterBottom variant="h6">Public Details</Typography>
          {public_rows}
        </>
      }
    </div>
  }
}

export default GigSummary;
