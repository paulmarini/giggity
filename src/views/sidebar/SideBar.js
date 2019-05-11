import React from 'react';
import GigList from './GigList';
import SettingsNav from './SettingsNav';
import { connect } from 'react-redux';
import {
  List,
  SwipeableDrawer
} from '@material-ui/core';
import actions from '../../store/actions';

import './SideBar.scss';

const SideBar = (props) => {
  const { location, width, drawerWidth, drawerOpen, showSidebar, updateDrawer } = props;
  if (!showSidebar) {
    return null;
  }

  const handleDrawerToggle = () => {
    props.updateDrawer(!props.drawerOpen);
  }

  const type = location.pathname.split('/')[1];
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
        <List
          style={{ width }}
        >
          {
            (type === 'settings') ?
              <SettingsNav handleDrawerToggle={handleDrawerToggle} currentLocation={location.pathname} /> :
              <GigList
                handleDrawerToggle={handleDrawerToggle}
                currentLocation={location.pathname}
              />
          }
        </List>
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
