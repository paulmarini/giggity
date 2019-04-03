import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
});

class SimpleSnackbar extends React.Component {
  handleClose = (event, reason) => {
    this.props.removeError();
  };

  render() {
    const { classes, errors } = this.props;
    return errors.reverse().map((error, i) => {
      return (<Snackbar
        key={i}
        className={classes.error}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        ContentProps={{ classes: { root: classes.error } }}
        open={true}
        // autoHideDuration={6000}
        onClose={this.handleClose}
        message={<span>{error.message || error}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />)

    });
  }
}

SimpleSnackbar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleSnackbar);
