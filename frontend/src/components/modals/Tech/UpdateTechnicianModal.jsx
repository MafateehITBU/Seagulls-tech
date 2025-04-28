import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const UpdateTechnicianModal = ({ show, handleClose, technician, fetchTechnicians }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (technician) {
            setName(technician.name || '');
            setEmail(technician.email || '');
            setPhone(technician.phone || '');
            setDob(new Date(technician.dob).toISOString().split('T')[0] || '');
            setProfilePic(null);
        }
    }, [technician]);

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^07[7-9]\d{7}$/.test(phone)) {
            newErrors.phone = 'Phone must start with 07 followed by 7,8, or 9 and 7 digits';
        }

        if (!dob) {
            newErrors.dob = 'Date of birth is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const dataToSend = {
                name,
                email,
                phone,
                dob
            };

            await axiosInstance.put(`/tech/${technician._id}`, dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Technician updated successfully');
            fetchTechnicians();
            handleClose();
        } catch (error) {
            console.error('Error updating technician:', error);
            toast.error(error.response?.data?.message || 'Failed to update technician');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Update Technician</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className='d-flex flex-column'>
                    <Form.Group controlId="name" className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter name"
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="phone" className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.phone}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="dob" className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            isInvalid={!!errors.dob}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.dob}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="profilePic" className="mb-3">
                        <Form.Label>Profile Picture</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={(e) => setProfilePic(e.target.files[0])}
                            accept="image/*"
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className='mt-4 align-self-center' style={{ width: "150px" }}>
                        Update Technician
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateTechnicianModal;