import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axiosConfig';

const AddReportModal = ({ show, handleClose, cleaningId, fetchData }) => {
    const [description, setDescription] = useState('');
    const [photoBefore, setPhotoBefore] = useState(null);
    const [photoAfter, setPhotoAfter] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!description || !photoBefore || !photoAfter) {
            toast.error('All fields are required');
            return;
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photoBefore', photoBefore);
        formData.append('photoAfter', photoAfter);

        try {
            setLoading(true);
            await axiosInstance.post(`/cleaning/tech/${cleaningId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Report Added successfully!', { position: 'top-right' });
            fetchData();
            handleClose();
            setDescription('');
            setPhotoBefore(null);
            setPhotoAfter(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Cleaning Report</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Photo Before</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoBefore(e.target.files[0])}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Photo After</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoAfter(e.target.files[0])}
                            required
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddReportModal;