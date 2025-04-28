import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const DeleteTechnicianModal = ({ show, handleClose, technician, fetchTechnicians }) => {
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/tech/${technician._id}`);
            toast.success('Technician deleted successfully');
            fetchTechnicians();
            handleClose();
        } catch (error) {
            console.error('Error deleting technician:', error);
            toast.error('Failed to delete technician');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Delete Technician</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">
                    Are you sure you want to delete technician <strong>{technician?.name}</strong>?
                    <br />
                    This action cannot be undone.
                </p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button variant="secondary" onClick={handleClose} style={{ width: "120px" }}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete} style={{ width: "120px" }}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteTechnicianModal; 