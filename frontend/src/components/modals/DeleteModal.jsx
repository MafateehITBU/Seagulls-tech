import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import { toast } from 'react-toastify';

const DeleteModal = ({ show, handleClose, id, fetchData, title, route}) => {
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/${route}/${id}`);
            toast.success(`${title} deleted successfully`);
            fetchData();
            handleClose();
        } catch (error) {
            console.error(`Error deleting ${title}:`, error);
            toast.error(`Failed to delete ${title}`);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Delete {title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">
                    Are you sure you want to delete <strong>{title}</strong>?
                    <br />
                    This action cannot be undone.
                </p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button variant="danger" onClick={handleDelete} style={{ width: "120px" }}>
                    Delete
                </Button>
                <Button variant="secondary" onClick={handleClose} style={{ width: "120px" }}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteModal; 