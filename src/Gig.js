import React, { Component } from 'react';
import requests from './requests';
import { connect } from 'react-redux';
import { actions } from './store';
import { Button } from '@material-ui/core';
import {TextField} from 'formik-material-ui';

import { Formik, Form, Field } from 'formik';
import UserAvailability from './UserAvailability';

const date = new Date().toJSON().slice(0,10);

const defaultState = {
  name: '',
  description: '',
  date,
  id: null,
  users: [],
  availability: {}
}

class Gig extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };
  componentDidMount () {
    this.updateGig();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {id} = this.props.match.params;
    if (id !== prevProps.match.params.id) {
      this.updateGig();
    }
  };
  componentWillUnmount () {
    const {id} = this.props.match.params;
    requests.unregister(`gig-${id}-updated`);
  };
  updateGig = () => {
    const {id} = this.props.match.params;
    if (id) {
      requests.register(`gig-${id}-updated`, (data) => {
        console.log('!!!!', data)
        this.setState(data);
        this.props.loadGig(data);
      });
      requests.register(`gig-${id}-availabilityUpdated`, (availability) => {
        console.log('&&&', availability)
        this.setState({availability});
      });
      requests.send('fetchGig', id);
    } else {
      this.setState(defaultState);
    }
  };

  saveGig = (values) => {
    console.log(values);
    this.setState(defaultState);
    return requests.save('gig', values)
      .then(gig => {
        console.log(gig);
        if (gig.id !== this.props.match.params.id) {
          this.props.history.push(`/gigs/${gig.id}`)
        }
      });
  };

  deleteGig = () => {
    const {id} = this.props.match.params;
    return requests.delete('gig', id)
      .then(() => {
        this.props.history.push(`/`);
      })

  }

  render() {
    const {name, users, id, availability} = this.state;
    console.log('***', users)
    return (
      <div>
        <h3>{name}</h3>
        <Formik onSubmit={this.saveGig} initialValues={this.state} enableReinitialize={true}>
          {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
            <Form>
              <Field
                name="name"
                label="Name"
                data-validators="isRequired"
                component={TextField}
              />
              <Field
                name="date"
                label="Date"
                type="date"
                component={TextField}
              />
              <Field
                name="description"
                label="Description"
                multiline
                helperText="yeay"
                placeholder="tekk ne"
                data-validators="isRequired"
                component={TextField}
              />
              <Button variant="contained" type="submit" color="primary">
                Save Gig
              </Button>
              <Button variant="contained" onClick={this.deleteGig} color="secondary">
                Delete Gig
              </Button>
            </Form>
          )}
        </Formik>
        <div style={{textAlign: 'left'}}>
          <h3>Users</h3>
          <ul>
            {
              users.map(user => {
                return (
                  <li key={user.id}>
                    {user.name}
                    <UserAvailability userId={user.id} gigId={id} status={availability[user.id]}/>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}
export default connect(
  null,
  {loadGig: actions.loadGig}
)(Gig);
