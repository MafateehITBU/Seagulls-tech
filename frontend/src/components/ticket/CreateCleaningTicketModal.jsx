import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import { toast } from 'react-toastify';

const CreateCleaningTicketModal = ({ show, handleClose, fetchData }) => {
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('Low');
    const [assetId, setAssetId] = useState('');
    const [description, setDescription] = useState('');
    const [assets, setAssets] = useState([]);
    const [techs, setTechs] = useState([]);
    const [assetType, setAssetType] = useState('');  // New state for Asset Type
    const [location, setLocation] = useState('');    // New state for Location

    useEffect(() => {
        fetchAssets();
        fetchTechs();
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

    const handleAssetChange = (e) => {
        const selectedAssetId = e.target.value;
        setAssetId(selectedAssetId);

        // Find the selected asset and set its type and location
        const selectedAsset = assets.find(asset => asset._id === selectedAssetId);
        if (selectedAsset) {
            setAssetType(selectedAsset.assetType || '');  // Set asset type
            setLocation(selectedAsset.location || '');    // Set location
        }
    };

    const resetForm = () => {
        setAssignedTo('');
        setPriority('Low');
        setAssetId('');
        setDescription('');
        setAssetType('');
        setLocation('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const ticketData = {
            assignedTo: assignedTo === "" ? undefined : assignedTo,
            priority,
            assetId,
            description
        };

        try {
            await axiosInstance.post('/cleaning', ticketData);
            toast.success('Ticket created successfully!', { position: "top-right" });
            fetchData();  // Refresh the ticket list
            resetForm();  // Clear the form
            handleClose(); // Close the modal after success
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error('Failed to create the ticket. ' + backendMessage, { position: "top-right" });
        }
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Create New Cleaning Ticket</Modal.Title>
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
                            onChange={handleAssetChange}  // Update the state on asset selection
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

export default CreateCleaningTicketModal;