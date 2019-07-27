import React from 'react';
import GigList from './GigList';
import SettingsNav from './SettingsNav';
import { connect } from 'react-redux';
import {
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
import { capitalize } from 'lodash';
import './SideBar.scss';

const SideBar = (props) => {
  const { history, location, width, drawerWidth, drawerOpen, showSidebar, updateDrawer, role_index } = props;
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
    }
  }

  const types = {
    admin: {
      routes: ['admin'],
      icon: <EventIcon />,
      details: <></>
    },
    gigs: {
      routes: ['gigs', 'rehearsals'],
      icon: <EventIcon />,
      details: <GigList
        handleDrawerToggle={handleDrawerToggle}
        currentLocation={location.pathname}
      />
    },
    settings: {
      routes: ['settings'],
      icon: <SettingsIcon />,
      details: <SettingsNav
        handleDrawerToggle={handleDrawerToggle}
        currentLocation={location.pathname}
      />
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
          ['admin', 'settings', 'gigs'].map(type => {
            const typeData = types[type];
            const expanded = typeData.routes.includes(currentType);
            if (type === 'admin' && role_index !== 0) {
              return null;
            }
            return (
              <ExpansionPanel
                key={type}
                expanded={expanded}
                onChange={handleChange(type)}
                className={expanded ? 'expanded' : 'collapsed'}
              >
                <ExpansionPanelSummary
                  className='summary'
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Grid container direction="row" alignItems="center" spacing={2}>
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
  drawerOpen: state.drawerOpen,
  role_index: state.currentUser.role_index
})

const mapDispatchToProps = {
  updateDrawer: actions.updateDrawer
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
