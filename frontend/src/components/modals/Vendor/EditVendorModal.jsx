import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';

const EditVendorModal = ({ show, handleClose, fetchData, selectedVendor }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (selectedVendor) {
            const assetData = {
                name: selectedVendor.name || '',
                email: selectedVendor.email || '',
                phone: selectedVendor.phone || '',
            };

            setFormData(assetData);
            setOriginalData(assetData);
        }
    }, [selectedVendor]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^07[789]\d{7}$/;
        return re.test(phone);
    };

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
            if (value !== originalData[key]) {
                if (value !== '' && value !== null && value !== undefined) {
                    cleanedData[key] = value;
                }
            }
        });

        if (Object.keys(cleanedData).length === 0) {
            toast.warning('No changes made to update.', { position: "top-right" });
            return;
        }

        // Only validate email if edited
        if (cleanedData.email !== undefined && !validateEmail(cleanedData.email)) {
            toast.error('Please enter a valid email address.', { position: "top-right" });
            return;
        }

        // Only validate phone if edited
        if (cleanedData.phone !== undefined && !validatePhone(cleanedData.phone)) {
            toast.error('Please enter a valid Jordanian phone number starting with 077, 078, or 079.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.put(`/vendor/${selectedVendor._id}`, cleanedData);
            toast.success('Vendor updated successfully!', { position: "top-right" });
            handleClose();
            fetchData();
        } catch (error) {
            toast.error('Failed to update vendor.', { position: "top-right" });
            console.error(error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Edit Vendor</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Form.Group controlId='name'>
                        <Form.Label>Vendor Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId='email' className='mt-3'>
                        <Form.Label>Vendor Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId='phone' className='mt-3'>
                        <Form.Label>Vendor Phone No.</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Update Vendor</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditVendorModal;