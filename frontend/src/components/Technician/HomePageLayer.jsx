import React, { useEffect, useState } from 'react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Modal, Button } from 'react-bootstrap';
import ReadOnlyMap from './ReadOnlyMap';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-25"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Tickets..."
    />
);

const TicketTable = ({ tickets, title, handleClaim, onMapView }) => {
    const columns = React.useMemo(() => [
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleClaim(row.original._id)}
                >
                    Claim
                </button>
            )
        },
        {
            Header: 'Priority',
            accessor: 'priority',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'High' ? 'bg-danger' : value === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {value}
                </span>
            )
        },
        {
            Header: 'Asset',
            accessor: row => row.assetId?.assetName || 'Asset'
        },
        {
            Header: 'Location',
            accessor: row => row.assetId?.location || 'Unassigned'
        },
        {
            Header: 'Description',
            accessor: 'description'
        },
        {
            Header: 'Map',
            accessor: 'map',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onMapView(row.original.assetId?.coordinates)}
                >
                    View
                </button>
            )
        }
    ], [handleClaim, onMapView]);

    const defaultColumn = React.useMemo(() => ({
        Cell: ({ value }) => value ?? '—'
    }), []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter,
        state
    } = useTable(
        { columns, data: tickets, defaultColumn },
        useGlobalFilter,
        useSortBy
    );

    return (
        <div className="card basic-data-table mb-5">
            <div className="card-header">
                <h5 className='mb-0'>{title} Tickets</h5>
            </div>
            <div className="card-body">
                {tickets.length === 0 ? (
                    <div className="text-center">No tickets found</div>
                ) : (
                    <div className="table-responsive" style={{ borderRadius: "6px" }}>
                        <table className="table table-bordered table-hover align-middle" {...getTableProps()}>
                            <thead className="table-light">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} className="text-center">
                                                {column.render('Header')}
                                                {' '}
                                                {column.isSorted ? (column.isSortedDesc ? <FaSortDown /> : <FaSortUp />) : <FaSort style={{ opacity: 0.3 }} />}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} className="text-center">
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const HomePageLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axiosInstance.get('/ticket/tech/unassigned');
            setTickets(response.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleClaim = async (ticketId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, claim it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.put(`/ticket/tech/claim/${ticketId}`);
                setTickets((prev) => prev.filter((t) => t._id !== ticketId));
                toast.success('Ticket claimed successfully!', { position: "top-right" });
            } catch (err) {
                console.error("Error claiming the ticket:", err);
                Swal.fire('Error', 'Failed to claim the ticket.', 'error');
            }
        }
    };

    const openMapView = (coordinates) => {
        if (coordinates && coordinates.lat !== undefined && (coordinates.lng !== undefined || coordinates.long !== undefined)) {
            const lng = coordinates.lng ?? coordinates.long;
            setSelectedCoordinates([coordinates.lat, lng]);
        } else {
            setSelectedCoordinates(null);
        }
        setShowMapModal(true);
    };

    const cleaning = tickets.filter(t => t.ticketType === 'cleaning');
    const maintenance = tickets.filter(t => t.ticketType === 'maintenance');
    const accident = tickets.filter(t => t.ticketType === 'accident');

    return (
        <div className="container mt-4">
            <ToastContainer />

            <TicketTable title="Accident" tickets={accident} handleClaim={handleClaim} onMapView={openMapView} />
            <TicketTable title="Cleaning" tickets={cleaning} handleClaim={handleClaim} onMapView={openMapView} />
            <TicketTable title="Maintenance" tickets={maintenance} handleClaim={handleClaim} onMapView={openMapView} />

            <Modal show={showMapModal} onHide={() => setShowMapModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Asset Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ReadOnlyMap coordinates={selectedCoordinates} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMapModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HomePageLayer;