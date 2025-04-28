import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';

const EditAssetModal = ({ show, handleClose, fetchData, selectedSparePart }) => {
    const [vendors, setVendors] = useState([]);

    const [formData, setFormData] = useState({
        partNo: '',
        partName: '',
        partBarcode: '',
        quantity: '',
        minStock: '',
        maxStock: '',
        expiryDate: '',
        leadTime: '',
        storageType: '',
        vendorId: '',
    });

    const [photo, setPhoto] = useState(null);
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        if (selectedSparePart) {
            const assetData = {
                partNo: selectedSparePart.partNo || '',
                partName: selectedSparePart.partName || '',
                partBarcode: selectedSparePart.partBarcode || '',
                minStock: selectedSparePart.minStock || '',
                maxStock: selectedSparePart.maxStock || '',
                leadTime: selectedSparePart.leadTime || '',
                expiryDate: selectedSparePart.expiryDate
                    ? new Date(selectedSparePart.expiryDate).toISOString().split('T')[0]
                    : '',
                quantity: selectedSparePart.quantity || '',
                storageType: selectedSparePart.maintenanceSchedule?.intervalInDays || '',
                vendorId: selectedSparePart.vendor?._id || '',
            };
            setFormData(assetData);
            setOriginalData(assetData);
        }
    }, [selectedSparePart]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await axiosInstance.get('/vendor');
            setVendors(response.data.vendors);
        } catch (err) {
            console.error('Error fetching vendors: ', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanedData = {};

        Object.entries(formData).forEach(([key, value]) => {
            if (value !== originalData[key]) {
                if (value !== '' && value !== null && value !== undefined) {
                    cleanedData[key] = value;
                }
            }
        });

        const formPayload = new FormData();

        for (const key in cleanedData) {
            formPayload.append(key, cleanedData[key]);
        }

        if (photo) {
            formPayload.append('sparePic', photo);
        }

        if (Object.keys(cleanedData).length === 0 && !photo) {
            toast.warning('No changes made to update.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.put(`/sparepart/${selectedSparePart._id}`, formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Spare Part updated successfully!', { position: "top-right" });
            handleClose();
            fetchData();
        } catch (error) {
            toast.error('Failed to update Spare Part.', { position: "top-right" });
            console.error(error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Edit Spare Part</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <Form.Label>Part No</Form.Label>
                            <Form.Control name="partNo" value={formData.partNo} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Part Name</Form.Label>
                            <Form.Control name="partName" value={formData.partName} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Barcode</Form.Label>
                            <Form.Control name="partBarcode" value={formData.partBarcode} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Min. Stock</Form.Label>
                            <Form.Control name="minStock" value={formData.minStock} onChange={handleChange} type='number' />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Max. Stock</Form.Label>
                            <Form.Control name="maxStock" value={formData.maxStock} onChange={handleChange} type='number' />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Expiry Date</Form.Label>
                            <Form.Control type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Lead Time</Form.Label>
                            <Form.Control name="leadTime" value={formData.leadTime} onChange={handleChange} type="text" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Storage Type</Form.Label>
                            <Form.Select name="storageType" value={formData.storageType} onChange={handleChange}>
                                <option value="">Select Storage Type</option>
                                <option value="cold">Cold</option>
                                <option value="regular">Regular</option>
                            </Form.Select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <Form.Label>Vendor</Form.Label>
                            <Form.Control
                                as="select"
                                name="vendorId"
                                value={formData.vendorId}
                                onChange={handleChange}
                            >
                                <option value="">Select Vendor</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor._id} value={vendor._id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                        <div className="col-md-12 mb-3">
                            <Form.Label>Update Spare Part Photo</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files[0])}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant="primary" type="submit">Update Spare Part</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAssetModal;
