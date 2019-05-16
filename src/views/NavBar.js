import React, { Component } from 'react';
import {
  AppBar,
  Toolbar,
  Hidden,
  IconButton,
  Typography,
  Select,
  MenuItem
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon
} from '@material-ui/icons';
import Link from '../components/Link'
import { connect } from 'react-redux';
import { actions } from '../store';
import { emit, logout } from '../socket';
import './NavBar.scss';

class NavBar extends Component {
  switchProject = async (event) => {
    const project = event.target.value;
    await emit('patch', 'users', this.props.currentUser.userId, { project });
    window.location.href = '/';
  }

  handleDrawerToggle = () => {
    this.props.updateDrawer(!this.props.drawerOpen);
  }

  renderSwitchProject() {
    const { currentUser: { project }, projects } = this.props;
    if (!projects || projects.length <= 1) {
      return null;
    }
    return (
      <Select
        style={{ color: '#fff' }}
        inputProps={{ color: "inherit" }}
        name="project"
        value={project}
        onChange={e => this.switchProject(e)}
      >
        {
          projects.map(({ name, _id }) =>
            <MenuItem
              key={_id}
              value={_id}
            >
              {name}
            </MenuItem>)
        }
      </Select>
    )
  }

  render() {
    const { authenticated } = this.props;
    return (
      <AppBar position="fixed" className='navbar'>
        <Toolbar>
          <Hidden smUp>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Typography variant="h4" color="inherit" noWrap style={{ flexGrow: 1 }}>
            <Link color="inherit" to='/'
              onClick={this.handleDrawerToggle}
            >
              Giggity
            </Link>
          </Typography>

          {authenticated &&
            <>
              {this.renderSwitchProject()}
              <Link color="inherit" to='/' onClick={() => logout()}>
                Logout
                <IconButton
                  color="inherit"
                  onClick={this.handleDrawerToggle}
                >
                  <LogoutIcon />
                </IconButton>
              </Link>
            </>
          }
        </Toolbar>
      </AppBar >
    )
  }
}

const mapStateToProps = state => ({
  authenticated: state.authenticated,
  currentUser: state.currentUser,
  projects: state.projects,
  drawerOpen: state.drawerOpen
});

const mapDispatchToProps = {
  updateDrawer: actions.updateDrawer
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
