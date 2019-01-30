import React from 'react';
import PropTypes from 'prop-types';

import Map from '../Map/Map';

import {
	Marker as LeafletMarker
} from 'leaflet';

class MapMarker extends Map {
	constructor(props) {
		super(props);
	}

	render() {
		// add any markers
		/**
		 * [
		 * 	{ latitude, longitude, class, markerType, popupText },
		 * 	{ latitude, longitude, class, markerType, popupText }
		 * ]
		 */
		console.log('does this work????', this.state.map);

		return 'foobar';
	}
}

MapMarker.propTypes = {

};

export default MapMarker;
