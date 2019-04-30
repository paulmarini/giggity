import React from 'react';
import GigList from './GigList';
import SettingsNav from './SettingsNav';
import { connect } from 'react-redux';
import { Drawer, List } from '@material-ui/core';
import './SideBar.scss';

const SideBar = (props) => {
  const { location, width, drawerWidth, drawerOpen, showSidebar } = props;
  if (!showSidebar) {
    return null;
  }
  const type = location.pathname.split('/')[1];
  return (
    <nav className='sidebar'>
      <Drawer
        anchor="left"
        className='gig-list'
        variant={width === 'xs' ? 'temporary' : 'permanent'}
        open={width !== 'xs' || drawerOpen}
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
            (type === 'gigs' || type === '') ?
              <GigList
                currentLocation={location.pathname}
              />
              :
              <SettingsNav currentLocation={location.pathname} />
          }
        </List>
      </Drawer>
    </nav>
  )

}
const mapStateToProps = state => ({
  drawerOpen: state.drawerOpen
})

export default connect(mapStateToProps)(SideBar);
