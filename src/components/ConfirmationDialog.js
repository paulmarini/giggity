import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import { confirmable } from 'react-confirm';

class ConfirmationDialog extends React.Component {
  render() {
    const {
      okLabel = 'OK',
      cancelLabel = 'Cancel',
      title,
      confirmation,
      show,
      proceed,
      // dismiss,
      cancel,
    } = this.props;
    return (
      <Dialog
        open={show}
        onClose={() => cancel('canceled')}
      >
        <DialogTitle>{title || confirmation}</DialogTitle>
        {
          title &&
          <DialogContent dividers>
            <DialogContentText>
              {confirmation}
            </DialogContentText>
          </DialogContent>
        }
        <DialogActions>
          <Button onClick={proceed} color="primary" variant="contained" autoFocus>
            {okLabel}
          </Button>
          <Button onClick={() => cancel('canceled')}>
            {cancelLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default confirmable(ConfirmationDialog);
