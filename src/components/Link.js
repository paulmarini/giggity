import React from 'react';
import { Link as MUILink } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default props => <MUILink component={Link} {...props} />
