import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../../axiosConfig";
import { toast } from 'react-toastify';

const CreateSparePartModal = ({ show, handleClose, fetchData }) => {
    const [vendors, setVendors] = useState([]);
    const [partNo, setPartNo] = useState('');
    const [partName, setPartName] = useState('');
    const [partBarcode, setPartBarcode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [minStock, setMinStock] = useState('');
    const [maxStock, setMaxStock] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [leadTime, setLeadTime] = useState('');
    const [storageType, setStorageType] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [photo, setPhoto] = useState(null);

    const fileInputRef = useRef(null);

    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    useEffect(() => {
        fetchVendors();
    }, [])

    const resetForm = () => {
        setPartNo('');
        setPartName('');
        setPartBarcode('');
        setQuantity('');
        setMinStock('');
        setMaxStock('');
        setExpiryDate('');
        setLeadTime('');
        setStorageType('');
        setPhoto(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await axiosInstance.get('/vendor');
            setVendors(response.data.vendors);
        } catch (err) {
            console.error('Error fetching vendors: ', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            toast.error('Please upload a photo for the spare part.', { position: "top-right" });
            return;
        }

        const formData = new FormData();
        formData.append('partNo', partNo);
        formData.append('partName', partName);
        formData.append('partBarcode', partBarcode);
        formData.append('quantity', quantity);
        formData.append('minStock', minStock);
        formData.append('maxStock', maxStock);
        formData.append('expiryDate', expiryDate);
        formData.append('leadTime', leadTime);
        formData.append('storageType', storageType);
        formData.append('vendorId', vendorId);
        formData.append('sparePic', photo);

        try {
            const response = await axiosInstance.post('/sparepart', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Spare Part created successfully!', { position: "top-right" });
            fetchData();
            resetForm();
            handleClose();
        } catch (error) {
            const backendMessage = error.response?.data?.message || error.message;
            toast.error('Failed to create the Spare Part. ' + backendMessage, { position: "top-right" });
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type.split('/')[1].toLowerCase();
            if (!allowedTypes.test(fileType)) {
                toast.error('Invalid file type. Please upload an image (jpeg, jpg, png, gif, webp, heic, heif).', { position: "top-right" });
                return;
            }
            if (file.size > maxFileSize) {
                toast.error('File is too large. Maximum allowed size is 5MB.', { position: "top-right" });
                return;
            }
            setPhoto(file);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} scrollable size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="h5">Create New Spare Part</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">

                    <div className="d-flex gap-3 align-items-start">
                        <Form.Group controlId="partNo" style={{ flex: 1 }}>
                            <Form.Label>Part No.</Form.Label>
                            <Form.Control
                                type="text"
                                value={partNo}
                                onChange={(e) => setPartNo(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="partName" style={{ flex: 1 }}>
                            <Form.Label>Part Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={partName}
                                onChange={(e) => setPartName(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                        <Form.Group controlId="partBarcode" style={{ flex: 1 }}>
                            <Form.Label>Barcode</Form.Label>
                            <Form.Control
                                type="text"
                                value={partBarcode}
                                onChange={(e) => setPartBarcode(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="quantity" style={{ flex: 1 }}>
                            <Form.Label>Quatity</Form.Label>
                            <Form.Control
                                type="number"
                                min='1'
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                        <Form.Group controlId="minStock" style={{ flex: 1 }}>
                            <Form.Label>Min. Stock</Form.Label>
                            <Form.Control
                                type="number"
                                min='1'
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="maxStock" style={{ flex: 1 }}>
                            <Form.Label>maxStock</Form.Label>
                            <Form.Control
                                type="number"
                                min='1'
                                value={maxStock}
                                onChange={(e) => setMaxStock(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                        <Form.Group controlId="expiryDate" style={{ flex: 1 }}>
                            <Form.Label>Expiry Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="leadTime" style={{ flex: 1 }}>
                            <Form.Label>Lead Time</Form.Label>
                            <Form.Control
                                type="text"
                                value={leadTime}
                                onChange={(e) => setLeadTime(e.target.value)}
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3 align-items-start">
                        <Form.Group controlId="storageType" style={{ flex: 1 }}>
                            <Form.Label>Storage Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={storageType}
                                onChange={(e) => setStorageType(e.target.value)}
                            >
                                <option value="regular">Regular</option>
                                <option value="cold">Cold</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="vendorId" style={{ flex: 1 }}>
                            <Form.Label>Vendor</Form.Label>
                            <Form.Control
                                as="select"
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                            >
                                {vendors.map((vendor) => (
                                    <option key={vendor._id} value={vendor._id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </div>

                    <Form.Group controlId="photo">
                        <Form.Label>Photo</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            ref={fileInputRef}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="align-self-center mt-3" style={{ width: "150px" }}>
                        Create Asset
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateSparePartModal;