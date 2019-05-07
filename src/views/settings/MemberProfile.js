import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';


const MemberProfile = ({ currentUser }) => {

  const submit = async values => {
    await emit('patch', 'users', currentUser.userId, values);
  }

  const fields = [
    { type: 'Text', label: 'Name', name: 'name' },
    { type: 'Email', label: 'Email', name: 'email' }
  ]

  return <Form
    initialValues={{ name: currentUser.name, email: currentUser.email }}
    onSubmit={submit}
    fields={fields}
    submitLabel="Save Profile"
  />
};

const mapStatetoProps = state => ((({ currentUser }) => ({ currentUser }))(state))

export default connect(mapStatetoProps)(MemberProfile);
