import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';


const ProjectProfile = ({ currentProject: { _id, name } }) => {

  const submit = async values => {
    await emit('patch', 'projects', _id, values);
  }

  const fields = [
    { type: 'Text', label: 'Project Name', name: 'name' }
  ]

  return <Form
    initialValues={{ name }}
    onSubmit={submit}
    fields={fields}
    submitLabel="Save Project"
  />
};

const mapStatetoProps = state => ((({ currentProject }) => ({ currentProject }))(state))

export default connect(mapStatetoProps)(ProjectProfile);
