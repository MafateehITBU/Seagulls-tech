import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const CreateMaintModal = ({ show, handleClose, fetchData, type }) => {
    const [priority, setPriority] = useState('Low');
    const [assetId, setAssetId] = useState('');
    const [description, setDescription] = useState('');
    const [assets, setAssets] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [location, setLocation] = useState('');
    const [requireSpare, setRequireSpare] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [requiredSpareParts, setRequiredSpareParts] = useState([]);
    const [ticketPhoto, setTicketPhoto] = useState(null);


    useEffect(() => {
        fetchAssets();
        fetchSpareParts();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await axiosInstance.get('/asset');
            setAssets(response.data);
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const fetchSpareParts = async () => {
        try {
            const response = await axiosInstance.get('/sparePart');
            setSpareParts(response.data);
        } catch (error) {
            console.error('Error fetching spare parts:', error);
        }
    };

    const handleAssetChange = (e) => {
        const selectedAssetId = e.target.value;
        setAssetId(selectedAssetId);

        const selectedAsset = assets.find(asset => asset._id === selectedAssetId);
        if (selectedAsset) {
            setAssetType(selectedAsset.assetType || '');
            setLocation(selectedAsset.location || '');
        }
    };

    const resetForm = () => {
        setPriority('Low');
        setAssetId('');
        setDescription('');
        setAssetType('');
        setLocation('');
        setRequireSpare(false);
        setRequiredSpareParts([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ticketPhoto) {
            toast.error("Please upload a ticket photo.", { position: "top-right" });
            return;
        }

        const formData = new FormData();
        formData.append("priority", priority);
        formData.append("assetId", assetId);
        formData.append("description", description);
        formData.append("requireSpareParts", requireSpare);
        formData.append("ticketPhoto", ticketPhoto);

        if (requireSpare) {
            requiredSpareParts.forEach(partId => {
                formData.append("spareParts[]", partId);
            });
        }

        try {
            await axiosInstance.post(`/${type}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Ticket created successfully!", { position: "top-right" });
            fetchData();
            resetForm();
            handleClose();
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error("Failed to create the ticket. " + backendMessage, { position: "top-right" });
        }
    };

    return (
        <Modal show={show} onHide={handleClose} scrollable >
            <Modal.Header closeButton>
                <Modal.Title className="h5">Create New Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='d-flex flex-column'>

                    {/* Priority dropdown */}
                    <Form.Group controlId="priority">
                        <Form.Label>Priority</Form.Label>
                        <Form.Control
                            as="select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            required
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </Form.Control>
                    </Form.Group>

                    {/* Asset dropdown */}
                    <Form.Group controlId="assetId">
                        <Form.Label>Asset</Form.Label>
                        <Form.Control
                            as="select"
                            value={assetId}
                            onChange={handleAssetChange}
                            required
                        >
                            <option value="">Select Asset</option>
                            {assets.map((asset) => (
                                <option key={asset._id} value={asset._id}>
                                    {asset.assetName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    {/* Display Asset Type and Location (Read-only) */}
                    <Form.Group controlId="assetType">
                        <Form.Label>Asset Type</Form.Label>
                        <Form.Control
                            type="text"
                            value={assetType}
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group controlId="location">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            value={location}
                            readOnly
                        />
                    </Form.Group>

                    {/* Require Spare Part Checkbox */}
                    <Form.Group controlId="requireSpare">
                        <Form.Check
                            type="checkbox"
                            label={<span>Require Spare Part?</span>}
                            checked={requireSpare}
                            onChange={(e) => setRequireSpare(e.target.checked)}
                            className="d-flex align-items-center mt-4"
                        />
                    </Form.Group>

                    {/* Spare Part Multi-select Dropdown */}
                    {requireSpare && (
                        <Form.Group controlId="spareParts">
                            <Form.Label>
                                Select Spare Parts {' '}
                                <span style={{ fontSize: '0.85em', color: '#6c757d' }}>
                                    (you can select multiple parts)
                                </span>
                            </Form.Label>
                            <select
                                multiple
                                className="form-control"
                                value={requiredSpareParts}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setRequiredSpareParts(selected.map(String));
                                }}
                                style={{
                                    height: '120px',
                                    overflowY: 'auto',
                                    padding: '8px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                {spareParts.map((part) => (
                                    <option 
                                        key={part._id} 
                                        value={part._id}
                                        style={{
                                            padding: '8px',
                                            margin: '2px 0',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            backgroundColor: requiredSpareParts.includes(part._id) ? '#e3f2fd' : 'transparent',
                                            color: requiredSpareParts.includes(part._id) ? '#1976d2' : '#212529',
                                            fontWeight: requiredSpareParts.includes(part._id) ? '500' : 'normal'
                                        }}
                                    >
                                        {part.partName}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-2" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                Hold Ctrl (Windows) or Command (Mac) to select multiple parts
                            </div>
                        </Form.Group>
                    )}

                    {/* Description textarea */}
                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="ticketPhoto">
                        <Form.Label>Upload Photo</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => setTicketPhoto(e.target.files[0])}
                        />
                    </Form.Group>


                    <Button variant="primary" type="submit" className='mt-4 align-self-center' style={{ width: "150px" }}>
                        Create Ticket
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateMaintModal;