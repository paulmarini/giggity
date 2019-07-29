import React from 'react';
import {
  Card,
  Grid,
  Typography,
  CardHeader,
  CardActionArea,
  Link as MUILink
} from '@material-ui/core';
import { Link } from 'react-router-dom';

const Welcome = props => {
  return (
    <>
      <Typography variant="h3" align="center" gutterBottom>Welcome to Giggity!</Typography>
      <Typography variant="body1" align="center" gutterBottom>blah blah blah abut giggity...</Typography>
      <Grid
        direction="row"
        justify="space-evenly"
        alignItems="center"
        spacing={5}
        container
      >
        <Grid item xs={6}>
          <Card raised>
            <CardActionArea component={MUILink} href="/auth/auth0">
              <CardHeader title="Sign In" align="center" />
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card raised>
            <CardActionArea component={Link} to="/signup">
              <CardHeader title="Sign Up" align="center" />
            </CardActionArea>
          </Card>
        </Grid>
      </Grid >
    </>

  )
}

export default Welcome
