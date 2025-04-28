import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';

const TechnicianModal = ({ show, handleClose, technician, fetchTechnicians }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        dob: '',
        profilePic: null
    });
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (technician) {
            setFormData({
                name: technician.name || '',
                email: technician.email || '',
                phone: technician.phone || '',
                dob: new Date(technician.dob).toISOString().split('T')[0] || '',
                password: '',
                profilePic: null
            });
            setPreviewImage(technician.photo);
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                dob: '',
                profilePic: null
            });
            setPreviewImage(null);
        }
    }, [technician]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^07[7-9]\d{7}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must start with 07 followed by 7,8, or 9 and 7 digits';
        }

        if (!technician && !formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'profilePic' && files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(files[0]);
        }

        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (technician) {
                await axiosInstance.put(`/tech/${technician._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Technician updated successfully');
            } else {
                await axiosInstance.post('/tech/add', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Technician added successfully');
            }

            handleClose();
            fetchTechnicians();
        } catch (error) {
            console.error('Error saving technician:', error);
            toast.error('Failed to save technician');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="text-primary fw-bold">
                    {technician ? 'Update Technician' : 'Add New Technician'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <div className="row">
                    <div className="col-md-4 text-center mb-4 mb-md-0">
                        <div className="position-relative d-inline-block">
                            <div
                                className="rounded-circle overflow-hidden"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    border: '3px solid #e9ecef',
                                    background: '#f8f9fa'
                                }}
                            >
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile Preview"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                        <Icon icon="mdi:account" className="text-muted" style={{ fontSize: '4rem' }} />
                                    </div>
                                )}
                            </div>
                            <label
                                className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 cursor-pointer"
                                style={{ transform: 'translate(25%, 25%)' }}
                            >
                                <Icon icon="mdi:camera" className="text-white" />
                                <input
                                    type="file"
                                    name="profilePic"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="d-none"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <Form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <Form.Label className="fw-medium">Name</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Icon icon="mdi:account" />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter name"
                                            isInvalid={!!errors.name}
                                            className="border-start-0"
                                        />
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Label className="fw-medium">Email</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Icon icon="mdi:email" />
                                        </span>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email"
                                            isInvalid={!!errors.email}
                                            className="border-start-0"
                                        />
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </div>

                                {!technician && (
                                    <div className="col-md-6 mb-3">
                                        <Form.Label className="fw-medium">Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Icon icon="mdi:lock" />
                                            </span>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter password"
                                                isInvalid={!!errors.password}
                                                className="border-start-0"
                                            />
                                        </div>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </div>
                                )}

                                <div className="col-md-6 mb-3">
                                    <Form.Label className="fw-medium">Phone</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Icon icon="mdi:phone" />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            isInvalid={!!errors.phone}
                                            className="border-start-0"
                                        />
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <Form.Label className="fw-medium">Date of Birth</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <Icon icon="mdi:calendar" />
                                        </span>
                                        <Form.Control
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            isInvalid={!!errors.dob}
                                            className="border-start-0"
                                        />
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.dob}
                                    </Form.Control.Feedback>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <button
                    className="btn btn-light"
                    onClick={handleClose}
                    style={{ minWidth: '100px' }}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    style={{ minWidth: '100px' }}
                >
                    {technician ? 'Update' : 'Add'}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default TechnicianModal; 