import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import { toast } from 'react-toastify';

const DeleteAdminModal = ({ show, handleClose, admin, fetchAdmins }) => {
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/admin/${admin._id}`);
            toast.success('Admin deleted successfully');
            fetchAdmins();
            handleClose();
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Failed to delete admin');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Delete Admin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">
                    Are you sure you want to delete admin <strong>{admin?.name}</strong>?
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

export default DeleteAdminModal; 