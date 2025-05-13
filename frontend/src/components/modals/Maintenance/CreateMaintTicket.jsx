import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const CreateMaintTicketModal = ({ show, handleClose, fetchData, type }) => {
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('Low');
    const [assetId, setAssetId] = useState('');
    const [description, setDescription] = useState('');
    const [assets, setAssets] = useState([]);
    const [techs, setTechs] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [location, setLocation] = useState('');
    const [requireSpare, setRequireSpare] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [requiredSpareParts, setRequiredSpareParts] = useState([]);

    useEffect(() => {
        fetchAssets();
        fetchTechs();
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

    const fetchTechs = async () => {
        try {
            const response = await axiosInstance.get('/tech');
            setTechs(response.data.techs);
        } catch (error) {
            console.error('Error fetching technicians:', error);
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
        setAssignedTo('');
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

        const ticketData = {
            assignedTo: assignedTo === "" ? undefined : assignedTo,
            priority,
            assetId,
            description,
            requireSpareParts: requireSpare,
            ...(requireSpare && { spareParts: requiredSpareParts })
        };

        try {
            await axiosInstance.post(`/${type}`, ticketData);
            toast.success('Ticket created successfully!', { position: "top-right" });
            fetchData();
            resetForm();
            handleClose();
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error('Failed to create the ticket. ' + backendMessage, { position: "top-right" });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Create New Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='d-flex flex-column'>

                    {/* Assigned To dropdown */}
                    <Form.Group controlId="assignedTo">
                        <Form.Label>Assigned To</Form.Label>
                        <Form.Control
                            as="select"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Everyone</option>
                            {techs.map((tech) => (
                                <option key={tech._id} value={tech._id}>
                                    {tech.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

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

                    <Button variant="primary" type="submit" className='mt-4 align-self-center' style={{ width: "150px" }}>
                        Create Ticket
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateMaintTicketModal;