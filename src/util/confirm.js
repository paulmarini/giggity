import Confirmation from '../components/ConfirmationDialog';
import { createConfirmation } from 'react-confirm';

const confirm = createConfirmation(Confirmation);

export default (confirmation, options = {}) => confirm({ confirmation, ...options });
