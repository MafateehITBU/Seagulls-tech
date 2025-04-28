import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';

const EditAssetModal = ({ show, handleClose, fetchData, selectedAsset }) => {
    const [formData, setFormData] = useState({
        assetNo: '',
        assetName: '',
        assetType: '',
        assetSubType: '',
        assetStatus: '',
        location: '',
        coordinates: '',
        installationDate: '',
        quantity: '',
        cleaningIntervalInDays: '',
        maintIntervalInDays: '',
    });

    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (selectedAsset) {
            const assetData = {
                assetNo: selectedAsset.assetNo || '',
                assetName: selectedAsset.assetName || '',
                assetType: selectedAsset.assetType || '',
                assetSubType: selectedAsset.assetSubType || '',
                assetStatus: selectedAsset.assetStatus || '',
                location: selectedAsset.location || '',
                coordinates: Array.isArray(selectedAsset.coordinates)
                    ? selectedAsset.coordinates.join(',')
                    : typeof selectedAsset.coordinates === 'object' && selectedAsset.coordinates !== null
                        ? Object.values(selectedAsset.coordinates).join(',')
                        : typeof selectedAsset.coordinates === 'string'
                            ? selectedAsset.coordinates
                            : '',
                installationDate: selectedAsset.installationDate
                    ? new Date(selectedAsset.installationDate).toISOString().split('T')[0]
                    : '',
                quantity: selectedAsset.quantity || '',
                cleaningIntervalInDays: selectedAsset.cleaningSchedule?.intervalInDays || '',
                maintIntervalInDays: selectedAsset.maintenanceSchedule?.intervalInDays || '',
            };

            setFormData(assetData);
            setOriginalData(assetData); // Set original data for comparison
        }
    }, [selectedAsset]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanedData = {};

        // Only send modified fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== originalData[key]) { // Only send if changed
                if (value !== '' && value !== null && value !== undefined) {
                    if (key === 'coordinates') {
                        cleanedData[key] = value.split(',').map(coord => parseFloat(coord.trim()));
                    } else {
                        cleanedData[key] = value;
                    }
                }
            }
        });

        console.log('Modified Data: ', cleanedData);

        if (Object.keys(cleanedData).length === 0) {
            toast.warning('No changes made to update.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.put(`/asset/${selectedAsset._id}`, cleanedData);
            toast.success('Asset updated successfully!', { position: "top-right" });
            handleClose();
            fetchData();
        } catch (error) {
            toast.error('Failed to update asset.', { position: "top-right" });
            console.error(error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Edit Asset</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label>Asset No</Form.Label>
                            <Form.Control name="assetNo" value={formData.assetNo} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Asset Name</Form.Label>
                            <Form.Control name="assetName" value={formData.assetName} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Asset Type</Form.Label>
                            <Form.Control name="assetType" value={formData.assetType} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Asset SubType</Form.Label>
                            <Form.Control name="assetSubType" value={formData.assetSubType} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Asset Status</Form.Label>
                            <Form.Select name="assetStatus" value={formData.assetStatus} onChange={handleChange}>
                                <option value="">Select Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control name="location" value={formData.location} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Coordinates (lat,lng)</Form.Label>
                            <Form.Control name="coordinates" value={formData.coordinates} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Installation Date</Form.Label>
                            <Form.Control type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Cleaning Interval (Days)</Form.Label>
                            <Form.Control type="number" name="cleaningIntervalInDays" value={formData.cleaningIntervalInDays} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Maintenance Interval (Days)</Form.Label>
                            <Form.Control type="number" name="maintIntervalInDays" value={formData.maintIntervalInDays} onChange={handleChange} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Update Asset</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAssetModal;