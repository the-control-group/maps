import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import {
	Map as LeafletMap,
	TileLayer as LeafletTileLayer,
	icon as LeafletIcon,
	marker as LeafletMarker,
	latLngBounds as LeafletBounds,
	layerGroup as LeafletLayerGroup
} from 'leaflet';

class Map extends Component {
	constructor(props) {
		super(props);

		this.state = {
			map: null,
			mapId: uuidv4(),
			markersLayer: null,
			bounds: []
		};

		this.createMap = this.createMap.bind(this);
		this.addMarkers = this.addMarkers.bind(this);
		this.adjustBounds = this.adjustBounds.bind(this);
	}

	componentDidMount() {
		this.setState({
			map: this.createMap()
		}, () => {
			this.addMarkers(true);
		});
	}

	componentDidUpdate(prevProps) {
		const { markersLayer } = this.state;

		// reset markers if they are changed
		if(prevProps.markers.length !== this.props.markers.length) {
			if(markersLayer) markersLayer.clearLayers();
			this.addMarkers();
		}
	}

	createMap() {
		const { mapId } = this.state,
			{ latitude, longitude, showZoomControls, zoom } = this.props;

		if(!latitude && !longitude) return null;

		// create the base map
		const map = new LeafletMap(`map-container-${mapId}`, {
			scrollWheelZoom: false,
			zoomControl: showZoomControls
		}).setView([
			parseFloat(latitude),
			parseFloat(longitude)
		], zoom);

		// add the base tile layer
		const tileLayer = new LeafletTileLayer('https://www.truthfinder.com/data/tiles/{z}/{x}/{y}.png');
		tileLayer.addTo(map);

		return map;
	}

	addMarkers(setBounds) {
		const { map } = this.state,
			{ markers } = this.props;

		// add any markers
		let markersLayer;
		const bounds = [];
		if(markers.length > 0) {
			markersLayer = new LeafletLayerGroup().addTo(map);

			markers.forEach(m => {
				const lat = parseFloat(m.latitude),
					lng = parseFloat(m.longitude);

				const markerIcon = new LeafletIcon({
					iconUrl: m.icon ? require(`../../markers/${m.icon}.png`) : require('../../markers/blue.png'),
					shadowUrl: require('../../markers/marker-shadow.png'),
					iconAnchor: [12, 40],
					popupAnchor: [2, -40]
				});

				const marker = new LeafletMarker([lat, lng], {
					icon: markerIcon
				});

				bounds.push({lat, lng});

				if(m.popupText) marker.bindPopup(m.popupText);

				markersLayer.addLayer(marker);
			});
		}

		this.setState({
			markersLayer,
			bounds
		}, () => {
			if(setBounds) this.adjustBounds();
		});
	}

	adjustBounds() {
		const { map, bounds } = this.state,
			{ markers } = this.props;

		if(markers.length > 1) {
			map.fitBounds(
				new LeafletBounds(bounds),
				{padding: [20, 20]}
			);
		}
	}

	render() {
		const { mapId } = this.state,
			{ height, width } = this.props;

		const style = {
			height: `${height}px`
		};

		if(width) style.width = `${width}px`;

		return (
			<div id={`map-container-${mapId}`} style={style}></div>
		);
	}
}

Map.propTypes = {
	latitude: PropTypes.number.isRequired,
	longitude: PropTypes.number.isRequired,
	showZoomControls: PropTypes.bool,
	zoom: PropTypes.number,
	height: PropTypes.string,
	width: PropTypes.string,
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
