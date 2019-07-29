import React from 'react';
import { connect } from 'react-redux';
import Form from '../../components/Form';
import { emit } from '../../socket';
import actions from '../../store/actions';

const MemberProfile = ({ currentUser, setUser }) => {

  const submit = async values => {
    const { name, email } = await emit('patch', 'users', currentUser.userId, values);
    setUser({ ...currentUser, email, name })
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

const mapDispatchToProps = {
  setUser: actions.setUser
}

export default connect(mapStatetoProps, mapDispatchToProps)(MemberProfile);
