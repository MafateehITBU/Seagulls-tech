import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import ReadOnlyMap from '../../Technician/ReadOnlyMap';

const AssetMoreInfoModal = ({ moreInfoAsset, closeModal }) => {
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        if (moreInfoAsset?.coordinates) {
            const { lat, lng, long } = moreInfoAsset.coordinates;
            if (lat !== undefined && (lng !== undefined || long !== undefined)) {
                const longitude = lng ?? long;
                setCoordinates([lat, longitude]);
            } else {
                setCoordinates(null);
            }
        }
    }, [moreInfoAsset]);

    return (
        <Modal show={!!moreInfoAsset} onHide={closeModal} size="lg" scrollable centered>
            <Modal.Header closeButton>
                <Modal.Title>Asset Info</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Asset No:</strong> {moreInfoAsset?.assetNo}</p>
                <p><strong>Asset Name:</strong> {moreInfoAsset?.assetName}</p>
                <p><strong>Asset Type:</strong> {moreInfoAsset?.assetType}</p>
                <p><strong>Location:</strong> {moreInfoAsset?.location}</p>
                <ReadOnlyMap coordinates={coordinates} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

AssetMoreInfoModal.propTypes = {
    moreInfoAsset: PropTypes.shape({
        assetNo: PropTypes.string,
        assetName: PropTypes.string,
        assetType: PropTypes.string,
        location: PropTypes.string,
        coordinates: PropTypes.object,
    }),
    closeModal: PropTypes.func.isRequired
};

export default AssetMoreInfoModal;