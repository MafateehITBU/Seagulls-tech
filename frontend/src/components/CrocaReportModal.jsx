import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CrocaReportModal = ({ croca, onClose }) => {
    return (
        <Modal show={!!croca} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Croca Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Type:</strong> {croca?.crocaType}</p>
                <p><strong>Cost:</strong> {croca?.cost}</p>
                {croca?.photo ? (
                    <div className="text-center">
                        <img src={croca.photo} alt="Croca" className="img-fluid" />
                    </div>
                ) : (
                    <p><em>No photo provided</em></p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CrocaReportModal;
