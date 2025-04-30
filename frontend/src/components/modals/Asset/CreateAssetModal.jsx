import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';
import LocationPickerMap from '../../LocationPickerMap';

const CreateAssetModal = ({ show, handleClose, fetchData }) => {
    const [assetNo, setAssetNo] = useState('');
    const [assetName, setAssetName] = useState('');
    const [assetType, setAssetType] = useState('DS8');
    const [assetSubType, setAssetSubType] = useState('8SQM');
    const [assetStatus, setAssetStatus] = useState('Active');
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: '', long: '' });
    const [installationDate, setInstallationDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [cleaningIntervalInDays, setCleaningIntervalInDays] = useState('');
    const [maintIntervalInDays, setMaintIntervalInDays] = useState('');
    const [photo, setPhoto] = useState(null);

    const fileInputRef = useRef(null);

    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const maxFileSize = 5 * 1024 * 1024;

    useEffect(() => {
        if (!show) resetForm();
    }, [show]);

    const resetForm = () => {
        setAssetNo('');
        setAssetName('');
        setAssetType('DS8');
        setAssetSubType('8SQM');
        setAssetStatus('Active');
        setLocation('');
        setCoordinates({ lat: '', long: '' });
        setInstallationDate('');
        setQuantity('');
        setCleaningIntervalInDays('');
        setMaintIntervalInDays('');
        setPhoto(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type.split('/')[1].toLowerCase();
            if (!allowedTypes.test(fileType)) {
                toast.error('Invalid file type. Supported: jpeg, jpg, png, gif, webp, heic, heif.');
                return;
            }
            if (file.size > maxFileSize) {
                toast.error('File too large. Max size: 5MB.');
                return;
            }
            setPhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            toast.error('Please upload a photo of the asset.');
            return;
        }

        if (!coordinates.lat || !coordinates.long) {
            toast.error('Please select a location on the map.');
            return;
        }

        const formData = new FormData();
        formData.append('assetNo', assetNo);
        formData.append('assetName', assetName);
        formData.append('assetType', assetType);
        formData.append('assetSubType', assetSubType);
        formData.append('assetStatus', assetStatus);
        formData.append('location', location);
        formData.append('coordinates[lat]', coordinates.lat);
        formData.append('coordinates[long]', coordinates.long);
        if (installationDate) formData.append('installationDate', installationDate);
        formData.append('quantity', quantity || 1);
        if (cleaningIntervalInDays) formData.append('cleaningIntervalInDays', cleaningIntervalInDays);
        if (maintIntervalInDays) formData.append('maintIntervalInDays', maintIntervalInDays);
        formData.append('assetPic', photo);

        try {
            await axiosInstance.post('/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Asset created successfully!');
            fetchData();
            handleClose();
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error(`Failed to create asset. ${backendMessage}`);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} scrollable size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create New Asset</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

                    <div className="d-flex gap-3">
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Asset No.</Form.Label>
                            <Form.Control type="text" value={assetNo} onChange={(e) => setAssetNo(e.target.value)} required />
                        </Form.Group>

                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Asset Name</Form.Label>
                            <Form.Control type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3">
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Asset Type</Form.Label>
                            <Form.Select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                                <option value="DS8">DS8</option>
                                <option value="DS10">DS10</option>
                                <option value="DS12">DS12</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Asset SubType</Form.Label>
                            <Form.Select value={assetSubType} onChange={(e) => setAssetSubType(e.target.value)}>
                                <option value="8SQM">8SQM</option>
                                <option value="10SQM">10SQM</option>
                                <option value="12SQM">12SQM</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3">
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Asset Status</Form.Label>
                            <Form.Select value={assetStatus} onChange={(e) => setAssetStatus(e.target.value)}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Location (text)</Form.Label>
                            <Form.Control type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3">
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Installation Date</Form.Label>
                            <Form.Control type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} />
                        </Form.Group>

                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3">
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Cleaning Interval (Days)</Form.Label>
                            <Form.Control type="number" min="1" value={cleaningIntervalInDays} onChange={(e) => setCleaningIntervalInDays(e.target.value)} />
                        </Form.Group>

                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label>Maintenance Interval (Days)</Form.Label>
                            <Form.Control type="number" min="1" value={maintIntervalInDays} onChange={(e) => setMaintIntervalInDays(e.target.value)} />
                        </Form.Group>
                    </div>

                    <Form.Group>
                        <Form.Label>Select Location on Map</Form.Label>
                        <LocationPickerMap
                            onLocationSelect={(coords) => {
                                if (coords) {
                                    const { lat, lng } = coords;
                                    setCoordinates({ lat, long: lng });
                                } else {
                                    setCoordinates({ lat: '', long: '' });
                                }
                            }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Photo</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            ref={fileInputRef}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="align-self-center mt-3" style={{ width: "150px" }}>
                        Create Asset
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateAssetModal;