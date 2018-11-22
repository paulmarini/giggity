import React, { Component } from 'react';
import requests from './requests';
import { Link } from 'react-router-dom'
import {Drawer, List, ListItem, ListItemText} from '@material-ui/core';

// import { subscribeToTimer } from './subscribeToTimer';

class GigList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			gigs: []
		}

	}
	componentDidMount () {
    requests.send('fetchGigs');
		requests.register('gigsUpdated', (data) => {
			console.error(data);
			this.setState({gigs: data})
		});
	}
	componentWillUnmount () {
		requests.unregister('gigsUpdated');
	}

	render() {
		return (
			<Drawer className='gig-list' variant="permanent" anchor="left" style={{width: this.props.width}}>
				<List  style={{width: this.props.width}}>
					<ListItem button component={Link} to={`/gigs/new`}>
						<ListItemText primary="New Gig" />
					</ListItem>
					{
						this.state.gigs.map(gig => {
							return (
								<ListItem button key={gig.id} component={Link} to={`/gigs/${gig.id}`}>
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

export default GigList;
