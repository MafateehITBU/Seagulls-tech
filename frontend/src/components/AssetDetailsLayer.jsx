import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { Table, Spinner, Alert } from "react-bootstrap";

const AssetDetailsLayer = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accidentTickets, setAccidentTickets] = useState([]);
    const [cleaningTickets, setCleaningTickets] = useState([]);
    const [maintTickets, setMaintTickets] = useState([]);

    useEffect(() => {
        fetchAsset();
        fetchAccientTickets();
        fetchCleaningTickets();
        fetchMaintTickets();
    }, [id]);

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

    const fetchAccientTickets = async () => {
        try {
            const res = await axiosInstance.get("/ticket/accident-tickets");
            const filtered = res.data.filter(ticket =>
                (!ticket.ticketId.assignedTo) &&
                (ticket.ticketId.assetId?._id === id)
            );
            setAccidentTickets(filtered);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch accident tickets");
            setLoading(false);
        }
    };

    const fetchCleaningTickets = async () => {
        try {
            const res = await axiosInstance.get("/ticket/cleaning-tickets");
            const filtered = res.data.filter(ticket =>
                (!ticket.ticketId.assignedTo) &&
                (ticket.ticketId.assetId?._id === id)
            );
            setCleaningTickets(filtered);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch cleaning tickets");
            setLoading(false);
        }
    };

    const fetchMaintTickets = async () => {
        try {
            const res = await axiosInstance.get("/ticket/maintenance-tickets");
            const filtered = res.data.filter(ticket =>
                (!ticket.ticketId.assignedTo) &&
                (ticket.ticketId.assetId?._id === id)
            );
            setMaintTickets(filtered);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch maintenance tickets");
            setLoading(false);
        }
    };

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
            <Table
                striped
                bordered
                hover
                responsive
                className="mx-auto" // Center the table horizontally
                style={{ maxWidth: '1000px' }}
            >
                <tbody>
                    <tr>
                        <td className="text-center"><strong>Asset No</strong></td>
                        <td className="text-center">{asset.assetNo || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Asset Name</strong></td>
                        <td className="text-center">{asset.assetName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Type</strong></td>
                        <td className="text-center">{asset.assetType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Sub-Type</strong></td>
                        <td className="text-center">{asset.assetSubType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Status</strong></td>
                        <td className="text-center">{asset.assetStatus || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Location</strong></td>
                        <td className="text-center">{asset.location || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Installation Date</strong></td>
                        <td className="text-center">{formatDate(asset.installationDate)}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Quantity</strong></td>
                        <td className="text-center">{asset.quantity || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Next Cleaning Date</strong></td>
                        <td className="text-center">{formatDate(asset.cleaningSchedule?.nextCleaningDate)}</td>
                    </tr>
                    <tr>
                        <td className="text-center"><strong>Next Maintenance Date</strong></td>
                        <td className="text-center">{formatDate(asset.maintenanceSchedule?.nextMaintenanceDate)}</td>
                    </tr>
                    {asset.photo && (
                        <tr>
                            <td className="text-center"><strong>Photo</strong></td>
                            <td className="text-center">
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