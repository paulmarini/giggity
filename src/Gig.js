import React, { Component } from 'react';
import requests from './requests';
import { Button } from '@material-ui/core';
import {TextField} from 'formik-material-ui';

import { Formik, Form, Field } from 'formik';

const date = new Date().toJSON().slice(0,10);

const defaultState = {
  name: '',
  description: '',
  date,
  id: null
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  };
  componentDidMount () {
    requests.register('gigUpdated', (data) => {
      const {id} = this.props.match.params;
      if (id) {
        this.setState(data)
      }
    });
    this.updateGig();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {id} = this.props.match.params;
    if (id !== prevProps.match.params.id) {
      this.updateGig();
    }
  };
  componentWillUnmount () {
    requests.unregister('gigUpdated');
  };
  updateGig = () => {
    const {id} = this.props.match.params;
    if (id) {
      requests.send('fetchGig', id);
    } else {
      this.setState(defaultState);
    }
  };

  saveGig = (values) => {
    console.log(values);
    this.setState(defaultState);
    return requests.saveGig(values)
      .then(gig => {
        console.log(gig);
        if (gig.id !== this.props.match.params.id) {
          this.props.history.push(`/gigs/${gig.id}`)
        }
      });
  };

  deleteGig = () => {
    const {id} = this.props.match.params;
    return requests.deleteGig(id)
      .then(() => {
        this.props.history.push(`/`);
      })

  }

  render() {
    const {name, date, description, id} = this.state;
    return (
      <div>
        <h3>{name}</h3>
        <Formik onSubmit={this.saveGig} initialValues={{name, date, description, id}} enableReinitialize={true}>
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
      </div>
    );
  }
}

export default Home;
