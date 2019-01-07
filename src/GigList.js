import React, { Component } from 'react';
import requests from './requests';
import { connect } from 'react-redux';
import { actions } from './store';

import { Link } from 'react-router-dom'
import {Drawer, List, ListItem, ListItemText} from '@material-ui/core';
import UserAvailability from './UserAvailability';

// import { subscribeToTimer } from './subscribeToTimer';

class GigList extends Component {

	// constructor(props) {
	// 	super(props);
	//
	// 	// this.state = {
	// 	// 	gigs: []
	// 	// }
	//
	// }
	componentDidMount () {
		console.log('list mounted')
		const {currentUser} = this.props;
		requests.register(`user-${currentUser.user}-availabilityUpdated`, (data) => {
			console.log('availabilityUpdated', data)
			this.props.loadUserAvailability(data);
		})
		requests.register('gigsUpdated', (data) => {
			console.log('gigsUpdated', data)
			this.props.loadGigs(data);
		});
		requests.send('fetchGigs');
	}
	componentWillUnmount () {
		requests.unregister('gigsUpdated');
	}

	render() {
		console.log('$$$', this.context.router)
		const {gigsList, currentGig, userAvailability, currentUser} = this.props;
		return (
			<Drawer className='gig-list' variant="permanent" anchor="left" style={{width: this.props.width}}>
				<List style={{width: this.props.width}}>
					<ListItem
						button
						component={Link}
						to={`/gigs/new`}
						selected={currentGig.id === 'new'}
					>
						<ListItemText primary="New Gig" />
					</ListItem>
					{
						gigsList.map(gig => {
							return (
								<ListItem
									button
									key={gig.id}
									component={Link}
									selected={currentGig.id === gig.id}
									to={`/gigs/${gig.id}`}
								>
								  <UserAvailability userId={currentUser.user} gigId={gig.id} status={userAvailability[gig.id]}/>
									 <ListItemText primary={gig.name} secondary={gig.date} />
								</ListItem>
							);
						})
					}

				</List>
			</Drawer>
		)
	}
}

export default connect(
	state => ((({gigsList, currentGig, currentUser, userAvailability}) => ({gigsList, currentGig, currentUser, userAvailability}))(state)),
	{loadGigs: actions.loadGigs, loadUserAvailability: actions.loadUserAvailability}
)(GigList);
