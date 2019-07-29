import { store } from '../store';

const roles = ['Root', 'Admin', 'Manager', 'Member', 'Read-Only'];

export const getUser = () => {
  const { currentUser } = store.getState();
  return currentUser;
};

export const isUserOrRole = ({ member_id, role }) => {
  const { currentUser: { member_id: current_member_id, role: current_role } } = store.getState();
  return roles.indexOf(current_role) <= roles.indexOf(role) || member_id === current_member_id;
}
