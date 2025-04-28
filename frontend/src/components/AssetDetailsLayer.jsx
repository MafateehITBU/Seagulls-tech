import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { Table, Spinner, Alert } from "react-bootstrap";

const AssetDetailsLayer = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await axiosInstance.get(`/asset/${id}`);
                setAsset(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch asset");
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id]);

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    };

    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md d-flex flex-column">
            <h2 className="text-2xl font-bold my-3 align-self-center">Asset Information</h2>
            <Table striped bordered hover responsive>
                <tbody>
                    <tr>
                        <td><strong>Asset No</strong></td>
                        <td>{asset.assetNo || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Asset Name</strong></td>
                        <td>{asset.assetName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Type</strong></td>
                        <td>{asset.assetType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Sub-Type</strong></td>
                        <td>{asset.assetSubType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Status</strong></td>
                        <td>{asset.assetStatus || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Location</strong></td>
                        <td>{asset.location || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Installation Date</strong></td>
                        <td>{formatDate(asset.installationDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Quantity</strong></td>
                        <td>{asset.quantity || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Next Cleaning Date</strong></td>
                        <td>{formatDate(asset.cleaningSchedule?.nextCleaningDate)}</td>
                    </tr>
                    <tr>
                        <td><strong>Next Maintenance Date</strong></td>
                        <td>{formatDate(asset.maintenanceSchedule?.nextMaintenanceDate)}</td>
                    </tr>
                    {asset.photo && (
                        <tr>
                            <td><strong>Photo</strong></td>
                            <td>
                                <img
                                    src={asset.photo}
                                    alt="Asset"
                                    className="img-fluid rounded shadow-sm w-25"
                                    onError={(e) => e.target.src = '/path/to/fallback/image.png'} // Add a fallback image
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default AssetDetailsLayer;