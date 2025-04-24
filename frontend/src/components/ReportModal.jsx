import React from 'react';
import { Modal } from 'react-bootstrap';

const ReportModal = ({ report, onClose }) => {
    return (
        <Modal show={true} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Report Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Description:</strong> {report.description}</p>
                <div className="row">
                    <div className="col-md-6 text-center">
                        <p><strong>Before</strong></p>
                        <img 
                        src={report.photoBefore} 
                        alt="Before" 
                        className="img-fluid rounded" 
                        style={{ height: '50vh', objectFit: 'cover' }} 
                        />
                    </div>
                    <div className="col-md-6 text-center">
                        <p><strong>After</strong></p>
                        <img 
                        src={report.photoAfter} 
                        alt="After" 
                        className="img-fluid rounded" 
                        style={{ height: '50vh', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ReportModal;