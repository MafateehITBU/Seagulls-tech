import React, { useState } from 'react';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form } from 'react-bootstrap';

const ReportEditModal = ({ report, closeModal, status, fetchData }) => {
    const [formData, setFormData] = useState({
        description: report?.description || '',
        photoBefore: report?.photoBefore || '',
        photoAfter: report?.photoAfter || '',
    });

    const [newPhotoBeforeFile, setNewPhotoBeforeFile] = useState(null);
    const [newPhotoAfterFile, setNewPhotoAfterFile] = useState(null);

    const isEditable = status !== 'Closed';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'before') {
                setNewPhotoBeforeFile(file);
                setFormData(prev => ({ ...prev, photoBefore: URL.createObjectURL(file) }));
            } else {
                setNewPhotoAfterFile(file);
                setFormData(prev => ({ ...prev, photoAfter: URL.createObjectURL(file) }));
            }
        }
    };

    const handleSubmit = async () => {
        if (!isEditable) {
            toast.error('Cannot edit a closed ticket.', { position: "top-right" });
            return;
        }

        const updatedData = new FormData();

        if (formData.description !== report.description) {
            updatedData.append('description', formData.description);
        }

        if (newPhotoBeforeFile) {
            updatedData.append('photoBefore', newPhotoBeforeFile);
        }

        if (newPhotoAfterFile) {
            updatedData.append('photoAfter', newPhotoAfterFile);
        }

        if (updatedData.keys().next().done) {
            toast.info('No changes made.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.put(`/report/${report._id}`, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Report updated successfully!', { position: "top-right" });
            fetchData();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update the report.', { position: "top-right" });
        }
    };

    return (
        <Modal show onHide={closeModal} scrollable centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                        rows={3}
                    />
                </Form.Group>

                <div className="mt-3">
                    <Form.Label>Photo Before</Form.Label>
                    <div className="d-flex justify-content-center position-relative">
                        <img
                            src={formData.photoBefore}
                            alt="Before"
                            style={{
                                width: '200px',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                        {isEditable && (
                            <>
                                <Button
                                    variant="secondary"
                                    className="position-absolute bottom-0 end-0 m-2"
                                    onClick={() => document.getElementById('photoBeforeInput').click()}
                                >
                                    Change
                                </Button>
                                <input
                                    id="photoBeforeInput"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageChange(e, 'before')}
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-3">
                    <Form.Label>Photo After</Form.Label>
                    <div className="d-flex justify-content-center position-relative">
                        <img
                            src={formData.photoAfter}
                            alt="After"
                            style={{
                                width: '200px',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                        {isEditable && (
                            <>
                                <Button
                                    variant="secondary"
                                    className="position-absolute bottom-0 end-0 m-2"
                                    onClick={() => document.getElementById('photoAfterInput').click()}
                                >
                                    Change
                                </Button>
                                <input
                                    id="photoAfterInput"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageChange(e, 'after')}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!isEditable}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReportEditModal;