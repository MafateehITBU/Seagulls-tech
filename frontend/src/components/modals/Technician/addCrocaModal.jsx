import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axiosConfig';

const AddCrocaModal = ({ show, handleClose, accidentId, fetchData }) => {
    const [crocaType, setCrocaType] = useState('');
    const [cost, setCost] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!crocaType || !cost || !photo) {
            toast.error('All fields are required');
            return;
        }

        const formData = new FormData();
        formData.append('crocaType', crocaType);
        formData.append('cost', cost);
        formData.append('crocaPic', photo);

        try {
            setLoading(true);
            await axiosInstance.post(`/accident/tech/croca/${accidentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Croca Report Added successfully!', { position: 'top-right' });
            fetchData();
            handleClose();
            setCrocaType('');
            setCost('');
            setPhoto(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add croca report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Croca</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Croca Type</Form.Label>
                        <Form.Select
                            value={crocaType}
                            onChange={(e) => setCrocaType(e.target.value)}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Croca">Croca</option>
                            <option value="Anonymous">Anonymous</option>
                            <option value="Insurance Expired">Insurance Expired</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Cost</Form.Label>
                        <Form.Select
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            required
                        >
                            <option value="">Select Cost</option>
                            <option value=">1000">Greater than 1000</option>
                            <option value="<1000">Less than 1000</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Photo</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files[0])}
                            required
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Croca'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddCrocaModal;