import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import { toast } from 'react-toastify';

const CreateCleaningTicketModal = ({ show, handleClose }) => {
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('Low');
    const [assetId, setAssetId] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const ticketData = {
            assignedTo,
            priority,
            assetId,
            description
        };

        try {
            const response = await axiosInstance.post('/cleaning', ticketData);
            toast.success('Ticket created successfully!', { position: "top-right" });
            handleClose(); // Close the modal after success
        } catch (error) {
            toast.error('Failed to create the ticket. ' + error.message, { position: "top-right" });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create New Cleaning Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='d-flex flex-column'>
                    <Form.Group controlId="assignedTo">
                        <Form.Label>Assigned To</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter the assigned tech"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            required
                        />
                    </Form.Group>

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

                    <Form.Group controlId="assetId">
                        <Form.Label>Asset ID</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter the asset ID"
                            value={assetId}
                            onChange={(e) => setAssetId(e.target.value)}
                            required
                        />
                    </Form.Group>

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

                    <Button variant="primary" type="submit" className='mt-4 align-self-center' style={{ width: "150px" }}>Create Ticket</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateCleaningTicketModal;
