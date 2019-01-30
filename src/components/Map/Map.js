import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	Map as LeafletMap,
	TileLayer as LeafletTileLayer,
	featureGroup as LeafletFeatureGroup,
	marker as LeafletMarker,
	latLngBounds as LeafletBounds
} from 'leaflet';

class Map extends Component {
	constructor(props) {
		super(props);

		this.state = {
			map: null
		};

		this.createMap = this.createMap.bind(this);
	}

	componentDidMount() {
		this.setState({
			map: this.createMap()
		});
	}

	createMap() {
		const {
			latitude,
			longitude,
			markers,
			showZoomControls,
			zoom
		} = this.props;

		if(!latitude && !longitude) return null;

		// create the base map
		const map = new LeafletMap('map-container', {
			scrollWheelZoom: false,
			zoomControl: showZoomControls
		}).setView([
			parseFloat(latitude),
			parseFloat(longitude)
		], zoom);

		// add the base tile layer
		const tileLayer = new LeafletTileLayer('https://www.truthfinder.com/data/tiles/{z}/{x}/{y}.png');
		tileLayer.addTo(map);

		// add any markers
		let featureGroup;
		const boundsArr = [];
		if(markers.length > 0) {
			featureGroup = new LeafletFeatureGroup().addTo(map);

			markers.forEach(m => {
				const lat = parseFloat(m.latitude),
					lng = parseFloat(m.longitude);

				/* TODO: take in a `markerType` to show different icons */
				const marker = new LeafletMarker([lat, lng]).addTo(map);

				boundsArr.push({lat, lng});

				if(m.popupText) marker.bindPopup(m.popupText);

				featureGroup.addLayer(marker);
			});
		}

		// set the map bounds if multiple markers are present
		let bounds;
		if(markers.length > 1) {
			bounds = new LeafletBounds(boundsArr);
			map.fitBounds(bounds, {padding: [20, 20]});
		}

		return map;
	}

	render() {
		const { height } = this.props;

		return (
			<div id="map-container" style={{ height: `${height}px` }}></div>
		);
	}
}

Map.propTypes = {
	latitude: PropTypes.number.isRequired,
	longitude: PropTypes.number.isRequired,
	showZoomControls: PropTypes.bool,
	zoom: PropTypes.number,
	height: PropTypes.string,
	markers: PropTypes.arrayOf(PropTypes.shape({
		latitude: PropTypes.number.isRequired,
		longitude: PropTypes.number.isRequired,
		type: PropTypes.string,
		class: PropTypes.string,
		popupText: PropTypes.string
	})).isRequired
};

Map.defaultProps = {
	showZoomControls: true,
	zoom: 5,
	height: '300'
};

export default Map;
