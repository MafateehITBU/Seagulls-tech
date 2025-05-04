import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Recenter map on position change
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 16);
        }
    }, [position]);
    return null;
};

const ReadOnlyMap = ({ coordinates }) => {
    if (!coordinates || coordinates.length !== 2) {
        return <div className="text-muted text-center">No coordinates available</div>;
    }

    return (
        <MapContainer
            center={coordinates}
            zoom={16}
            style={{ height: '400px', width: '100%' }}
        >

            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={coordinates}>
                <Popup>Asset Location</Popup>
            </Marker>
            <RecenterMap position={coordinates} />
        </MapContainer>
    );
};

export default ReadOnlyMap;
