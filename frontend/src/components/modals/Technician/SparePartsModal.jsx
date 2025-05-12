import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axiosConfig';

const SparePartsModal = ({ closeModal, ID, spareParts, requireSpareParts: initialRequire, route, fetchData }) => {
    const [sparePartsList, setSparePartsList] = useState([]);
    const [requireSpareParts, setRequireSpareParts] = useState(initialRequire || false);
    const [selectedSpareParts, setSelectedSpareParts] = useState(spareParts ? spareParts.map(part => part._id) : []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSpareParts();
    }, []);

    const fetchSpareParts = async () => {
        try {
            const response = await axiosInstance.get('/sparepart');
            setSparePartsList(response.data);
        } catch (error) {
            console.error('Error fetching spare parts:', error);
            toast.error('Error fetching spare parts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (partId) => {
        setSelectedSpareParts((prev) =>
            prev.includes(partId)
                ? prev.filter((id) => id !== partId)
                : [...prev, partId]
        );
    };

    const updateSpareParts = async () => {
        try {
            const response = await axiosInstance.put(`/${route}/spareparts/${ID}`, {
                requireSpareParts,
                spareParts: selectedSpareParts,
            });
            toast.success('Spare parts updated successfully!');
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error updating spare parts:', error);
            toast.error('Error updating spare parts. Please try again later.');
        }
    };

    return (
        <Modal show={!!spareParts} onHide={closeModal} size="lg" scrollable centered>
            <Modal.Header closeButton>
                <Modal.Title>Spare Parts</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="d-flex flex-column align-items-center">
                        <div className="d-flex align-items-center mb-3" style={{ fontSize: '1.5rem' }}>
                            <Form.Check
                                type="checkbox"
                                id="require-spare"
                                checked={requireSpareParts}
                                onChange={(e) => setRequireSpareParts(e.target.checked)}
                                className="me-4"
                            />
                            <Form.Label htmlFor="require-spare" className="mb-0" style={{ fontSize: '1.5rem' }}>
                                Require Spare Parts
                            </Form.Label>
                        </div>

                        {requireSpareParts && (
                            <ul className="mt-3 d-flex gap-5 flex-wrap" style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {sparePartsList.map((part) => (
                                    <li key={part._id}>
                                        <div className="d-flex align-items-center mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                id={`spare-part-${part._id}`}
                                                checked={selectedSpareParts.includes(part._id)}
                                                onChange={() => handleCheckboxChange(part._id)}
                                                className="me-2"
                                            />
                                            <Form.Label htmlFor={`spare-part-${part._id}`} className="mb-0">
                                                {part.partName}
                                            </Form.Label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}


                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={updateSpareParts} disabled={loading}>
                    {loading ? 'Loading...' : 'Update Spare Parts'}
                </Button>
                <Button variant="secondary" onClick={closeModal}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SparePartsModal;