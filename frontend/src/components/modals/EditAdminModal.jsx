import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../axiosConfig';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';

const EditAdminModal = ({ show, handleClose, fetchAdmins, selectedAdmin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (selectedAdmin) {
            const adminData = {
                name: selectedAdmin.name || '',
                email: selectedAdmin.email || '',
                phone: selectedAdmin.phone || '',
                bio: selectedAdmin.bio || ''
            };

            setFormData(adminData);
            setOriginalData(adminData);
            setImagePreview(selectedAdmin.photo || '');
        }
    }, [selectedAdmin]);

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanedData = new FormData();

        // Only send modified fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== originalData[key]) {
                if (value !== '' && value !== null && value !== undefined) {
                    cleanedData.append(key, value);
                }
            }
        });

        // Add the file if it exists
        if (selectedFile) {
            cleanedData.append('profilePic', selectedFile);
        }

        if (cleanedData.entries().next().done && !selectedFile) {
            toast.warning('No changes made to update.', { position: "top-right" });
            return;
        }

        // Only validate email if edited
        if (formData.email !== originalData.email && !validateEmail(formData.email)) {
            toast.error('Please enter a valid email address.', { position: "top-right" });
            return;
        }

        // Only validate phone if edited
        if (formData.phone !== originalData.phone && !validatePhone(formData.phone)) {
            toast.error('Please enter a valid Jordanian phone number starting with 077, 078, or 079.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.put(`/admin/${selectedAdmin._id}`, cleanedData);
            toast.success('Admin updated successfully!', { position: "top-right" });
            handleClose();
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update admin.', { position: "top-right" });
            console.error(error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Edit Admin</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="text-center mb-4">
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
                                <img 
                                    src={imagePreview} 
                                    alt="Profile Preview" 
                                    className="w-100 h-100 object-fit-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Admin')}&size=128`;
                                    }}
                                />
                            </div>
                            <label 
                                className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 cursor-pointer"
                                style={{ 
                                    transform: 'translate(25%, 25%)',
                                    border: '2px solid white',
                                    boxShadow: '0 0 5px rgba(0,0,0,0.3)'
                                }}
                            >
                                <Icon icon="mdi:camera" style={{ fontSize: '1.5rem', color: 'white' }} />
                                <input
                                    type="file"
                                    name="profilePic"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="d-none"
                                />
                            </label>
                        </div>
                    </div>

                    <Form.Group controlId='name'>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId='email' className='mt-3'>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId='phone' className='mt-3'>
                        <Form.Label>Phone No.</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId='bio' className='mt-3'>
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Update Admin</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAdminModal; 