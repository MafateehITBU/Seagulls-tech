import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SearchControl = ({ provider }) => {
    const map = useMap();

    useEffect(() => {
        const searchControl = new GeoSearchControl({
            provider,
            style: 'bar',
            autoComplete: true,
            autoCompleteDelay: 250,
            showMarker: true,
            retainZoomLevel: false,
            animateZoom: true,
        });

        map.addControl(searchControl);

        return () => {
            map.removeControl(searchControl);
        };
    }, [map, provider]);

    return null;
};

const LocationPickerMap = ({ initialPosition, onLocationSelect }) => {
    const [marker, setMarker] = useState(initialPosition);

    // Update marker position when initialPosition prop changes
    useEffect(() => {
        if (initialPosition) {
            setMarker(initialPosition);
        }
    }, [initialPosition]);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setMarker([lat, lng]);
                onLocationSelect({ lat, lng });
            },
        });
        return null;
    };

    return (
        <MapContainer center={marker || [31.9632, 35.9304]} zoom={8} style={{ height: '400px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchControl provider={new OpenStreetMapProvider()} />
            <MapClickHandler />
            {marker && (
                <Marker position={marker}>
                    <Popup>Selected Location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default LocationPickerMap;