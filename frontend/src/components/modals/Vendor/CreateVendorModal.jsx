import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const CreateVendorModal = ({ show, handleClose, fetchData }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^07[789]\d{7}$/;
        return re.test(phone);
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address.', { position: "top-right" });
            return;
        }

        if (!validatePhone(phone)) {
            toast.error('Please enter a valid Jordanian phone number starting with 077, 078, or 079.', { position: "top-right" });
            return;
        }

        const ticketData = { name, email, phone };

        try {
            await axiosInstance.post('/vendor', ticketData);
            toast.success('Vendor created successfully!', { position: "top-right" });
            fetchData();
            resetForm();
            handleClose();
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error('Failed to create the Vendor. ' + backendMessage, { position: "top-right" });
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Create New Vendor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='d-flex flex-column'>

                    <Form.Group controlId="name">
                        <Form.Label>Vendor Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Vendor Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className='mt-4 align-self-center' style={{ width: "150px" }}>
                        Create Vendor
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateVendorModal;