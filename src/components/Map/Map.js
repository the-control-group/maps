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
		// initialize the base map when the component mounts
		this.setState({
			map: this.createMap()
		}, () => {
			// add in default map features
			this.addMarkers(true);
		});
	}

	componentDidUpdate(prevProps) {
		const { markersLayer } = this.state;

		// reset markers if they are changed (for example, via a toggle switch)
		if(prevProps.markers.length !== this.props.markers.length) {
			if(markersLayer) markersLayer.clearLayers();
			this.addMarkers();
		}
	}

	/**
	 * Set up the basic map + add the tile layer
	 */
	createMap() {
		const { mapId } = this.state,
			{ latitude, longitude, showZoomControls, zoom, tiles, enableDragging, enableTap  } = this.props,
			parsedLat = parseFloat(latitude),
			parsedLon = parseFloat(longitude);

		if(Number.isNaN(parsedLat) || Number.isNaN(parsedLon) || !tiles) return null;

		// create the base map
		const map = new LeafletMap(`map-container-${mapId}`, {
			scrollWheelZoom: false,
			zoomControl: showZoomControls,
			// control dragging and tap in order to prevent scroll hijacking
			tap: enableTap,
			dragging: enableDragging
		}).setView([
			parsedLat,
			parsedLon
		], zoom);

		// add the base tile layer
		const tileLayer = new LeafletTileLayer(tiles);
		tileLayer.addTo(map);

		return map;
	}

	/**
	 * Add the markers/features on top of the map
	 */
	addMarkers(setBounds) {
		const { map } = this.state,
			{ markers } = this.props;

		const bounds = [];
		let markersLayer;
		if(markers.length > 0) {
			markersLayer = new LeafletLayerGroup().addTo(map);

			markers.forEach(m => {
				const lat = parseFloat(m.latitude),
					lng = parseFloat(m.longitude);

				// will eventually add a way to send in custom markers. for now, it's a
				// standard set of colored markers (blue, red, and yellow)
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
			// we only want to do this on the initial setup
			if(setBounds) this.adjustBounds();
		});
	}

	/**
	 * The bounds frame the map to shwo all of the markers at once
	 */
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

		// set the sizing styles
		const style = { height: `${height}px` };
		if(width) style.width = `${width}px`;

		return (
			<div id={`map-container-${mapId}`} style={style}></div>
		);
	}
}

Map.propTypes = {
	tiles: PropTypes.string.isRequired,
	latitude: PropTypes.number.isRequired,
	longitude: PropTypes.number.isRequired,
	showZoomControls: PropTypes.bool,
	enableTap: PropTypes.bool,
	enableDragging: PropTypes.bool,
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
