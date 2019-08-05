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
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import themeConfig from '../util/themeConfig';

const theme = createMuiTheme(themeConfig);

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
      <>
        <MuiThemeProvider theme={theme}>
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
        </MuiThemeProvider>
      </>
    );
  }
}

export default confirmable(ConfirmationDialog);
