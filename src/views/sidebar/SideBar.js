import React from 'react';
import GigList from './GigList';
import SettingsNav from './SettingsNav';
import { connect } from 'react-redux';
import {
  List,
  SwipeableDrawer,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Grid
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Event as EventIcon
} from '@material-ui/icons';
import actions from '../../store/actions';
import {capitalize} from 'lodash';
import { Redirect } from 'react-router-dom';
import './SideBar.scss';

const SideBar = (props) => {
  const { history, location, width, drawerWidth, drawerOpen, showSidebar, updateDrawer } = props;
  const currentType = location.pathname.split('/')[1];
  
  if (!showSidebar) {
    return null;
  }

  const handleDrawerToggle = () => {
    props.updateDrawer(!props.drawerOpen);
  }

  const handleChange = type => () => {
    if (type !== currentType) {
      history.push(`/${type}`);
      // window.location.href = `/${type}`
    }
  }

  const types = {
    gigs: {
      icon: <EventIcon/>,
      details: <GigList
        handleDrawerToggle={handleDrawerToggle}
        currentLocation={location.pathname}
      /> 
    },
    settings: {
      icon: <SettingsIcon/>,
      details: <SettingsNav handleDrawerToggle={handleDrawerToggle} currentLocation={location.pathname} />
    }
  }

  return (
    <nav>
      <SwipeableDrawer
        anchor="left"
        className='sidebar'
        variant={width === 'xs' ? 'temporary' : 'permanent'}
        open={width !== 'xs' || drawerOpen}
        onClose={() => updateDrawer(false)}
        onOpen={() => updateDrawer(true)}
        PaperProps={{
          style: {
            width: drawerWidth
          }
        }}
      >
      {
        Object.keys(types).map(type => {
          const typeData = types[type];
          return (
            <ExpansionPanel
              key={type}
              expanded={currentType === type}
              onChange={handleChange(type)}
              className={currentType === type ? 'expanded' : 'collapsed'}
            >
              <ExpansionPanelSummary
                className='summary'
                expandIcon={<ExpandMoreIcon/>}
              >
                <Grid container direction="row" alignItems="center" spacing={16}>
                  <Grid item>
                    {typeData.icon}
                  </Grid>
                  <Grid item>
                    <Typography variant={"body1"}>
                      {capitalize(type)}
                    </Typography>
                  </Grid>
                </Grid>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className='details'>
                {typeData.details}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        })
      }
      </SwipeableDrawer>
    </nav>
  )

}
const mapStateToProps = state => ({
  drawerOpen: state.drawerOpen
})

const mapDispatchToProps = {
  updateDrawer: actions.updateDrawer
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
