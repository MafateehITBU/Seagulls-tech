import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import { Modal, Button, Form } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import ReportModal from '../modals/ReportModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateTicketModal from '../modals/Maintenance/CreateMaintTicket';
import DeleteModal from '../modals/DeleteModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Maintenance Tickets..."
    />
);

const MaintenanceLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [selectedTicketDelete, setSelectedTicketDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedTicketForReject, setSelectedTicketForReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOpenedBy, setSelectedOpenedBy] = useState('all');
    const [selectedAssignedTo, setSelectedAssignedTo] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [openedByOptions, setOpenedByOptions] = useState([]);
    const [assignedToOptions, setAssignedToOptions] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/ticket/maintenance-tickets');
            const filtered = Array.isArray(response.data)
                ? response.data.filter(ticket => ticket.ticketId?.techTicketApprove === true)
                : [];
            setTickets(filtered);
            // Extract unique Opened By Model and Assigned To
            setOpenedByOptions([
                ...new Set(filtered.map(t => t.ticketId?.openedByModel).filter(Boolean))
            ]);
            setAssignedToOptions([
                ...new Set(filtered.map(t => t.ticketId?.assignedTo?.name).filter(Boolean))
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOpenedByChange = (e) => {
        setSelectedOpenedBy(e.target.value);
    };
    const handleAssignedToChange = (e) => {
        setSelectedAssignedTo(e.target.value);
    };
    const handlePriorityChange = (e) => {
        setSelectedPriority(e.target.value);
    };
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const filteredData = React.useMemo(() => {
        return tickets.filter(ticket => {
            const openedByMatch = selectedOpenedBy === 'all' || ticket.ticketId?.openedByModel === selectedOpenedBy;
            const assignedToMatch = selectedAssignedTo === 'all' || ticket.ticketId?.assignedTo?.name === selectedAssignedTo;
            const priorityMatch = selectedPriority === 'all' || ticket.ticketId?.priority === selectedPriority;
            const statusMatch = selectedStatus === 'all' || ticket.ticketId?.status === selectedStatus;
            return openedByMatch && assignedToMatch && priorityMatch && statusMatch;
        });
    }, [tickets, selectedOpenedBy, selectedAssignedTo, selectedPriority, selectedStatus]);

    const handleDelete = async (maint) => {
        setSelectedTicketDelete(maint);
        setShowDeleteModal(true);
    };

    const handleCloseStatus = async (ticketId) => {
        try {
            await axiosInstance.post(`/ticket/close/${ticketId}`);
            setTickets(prev => prev.filter(t => t.ticketId._id !== ticketId));
            toast.success('Ticket closed successfully!', { position: "top-right" });
        } catch (error) {
            toast.error('Failed to close the ticket.', { position: "top-right" });
        }
    };

    const handleApprove = async (ticketId) => {
        try {
            await axiosInstance.post(`/ticket/approve/${ticketId}`);
            toast.success('Ticket approved successfully!', { position: "top-right" });
            fetchData(); // Refresh tickets
        } catch (error) {
            toast.error('Failed to approve the ticket.', { position: "top-right" });
        }
    };

    const openRejectModal = (ticketId) => {
        setSelectedTicketForReject(ticketId);
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason.', { position: "top-right" });
            return;
        }

        try {
            await axiosInstance.post(`/ticket/reject/${selectedTicketForReject}`, { rejectionReason: rejectReason });
            toast.success('Ticket rejected successfully!', { position: "top-right" });
            setShowRejectModal(false);
            setRejectReason('');
            fetchData(); // Refresh tickets
        } catch (error) {
            toast.error('Failed to reject the ticket.', { position: "top-right" });
        }
    };

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Opened By',
            accessor: row => row.ticketId?.openedByModel || 'N/A',
            Cell: ({ value, row }) => {
                const openedByModel = row.original.ticketId?.openedByModel;
                return (
                    <div style={{ width: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        <strong>{openedByModel}</strong>: {value}
                    </div>
                )
            }
        },
        {
            Header: 'Assigned To',
            accessor: row => row.ticketId?.assignedTo?.name || 'Unassigned',
        },
        {
            Header: 'Priority',
            accessor: row => row.ticketId?.priority,
            Cell: ({ value }) => (
                <span className={`badge ${value === 'High' ? 'bg-danger' : 'bg-secondary'}`}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Asset',
            accessor: row => row.ticketId?.assetId?.assetName || 'Unknown',
        },
        {
            Header: 'Description',
            accessor: row => row.ticketId?.description,
            Cell: ({ value }) => <div style={{ width: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{value}</div>,
        },
        {
            Header: 'Created At',
            accessor: row => new Date(row.ticketId?.createdAt).toLocaleDateString(),
        },
        {
            Header: 'Approved',
            accessor: row => row.ticketId?.approved,
            Cell: ({ row }) => {
                const approved = row.original.ticketId?.approved;
                const ticketId = row.original.ticketId?._id;

                if (approved === true) {
                    return <span className="badge bg-success">Approved</span>;
                }

                if (approved === false) {
                    // Show "Rejected" but make it a dropdown with only "Approve"
                    return (
                        <div className="dropdown">
                            <span
                                className="badge bg-danger dropdown-toggle"
                                data-bs-toggle="dropdown"
                                role="button"
                                style={{ cursor: 'pointer' }}
                            >
                                Rejected
                            </span>
                            <ul className="dropdown-menu">
                                <li>
                                    <button className="dropdown-item" onClick={() => handleApprove(ticketId)}>
                                        Approve
                                    </button>
                                </li>
                            </ul>
                        </div>
                    );
                }

                // If undefined or null => show full dropdown
                return (
                    <div className="dropdown">
                        <span
                            className="badge bg-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                            role="button"
                            style={{ cursor: 'pointer' }}
                        >
                            Take Action
                        </span>
                        <ul className="dropdown-menu">
                            <li>
                                <button className="dropdown-item" onClick={() => handleApprove(ticketId)}>
                                    Approve
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={() => openRejectModal(ticketId)}>
                                    Reject
                                </button>
                            </li>
                        </ul>
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: row => row.ticketId?.status,
            Cell: ({ row }) => {
                const status = row.original.ticketId.status;
                const ticketId = row.original.ticketId._id;
                return status !== 'Closed' ? (
                    <div className="dropdown">
                        <span
                            className={`badge dropdown-toggle ${status === 'Rejected' ? 'bg-warning' : 'bg-info'}`}
                            data-bs-toggle="dropdown"
                            role="button"
                            style={{ cursor: 'pointer' }}
                        >
                            {status}
                        </span>
                        <ul className="dropdown-menu">
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleCloseStatus(ticketId)}
                                >
                                    Close
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <span className="badge bg-success">Closed</span>
                );
            },
        },
        {
            Header: 'Report',
            accessor: row => row.reportId,
            Cell: ({ row }) => {
                const report = row.original.reportId;
                return report ? (
                    <span style={{ cursor: 'pointer' }} onClick={() => setSelectedReport(report)}>
                        <Icon icon="mdi:clipboard-text" />
                    </span>
                ) : '—';
            },
        },
        {
            Header: 'Reject Report',
            accessor: row => row.rejectReportId,
            Cell: ({ row }) => {
                const report = row.original.rejectReportId;
                return report ? (
                    <span style={{ cursor: 'pointer' }} onClick={() => setSelectedReport(report)}>
                        <Icon icon="mdi:clipboard-text" />
                    </span>
                ) : '—';
            },
        },
        {
            Header: 'Delete',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(row.original)}
                >
                    <Icon icon="mdi:delete" />
                </button>
            ),
        },
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        pageOptions,
        state: { pageIndex, globalFilter },
        prepareRow,
        setGlobalFilter,
        gotoPage,
    } = useTable(
        { columns, data: filteredData, initialState: { pageSize: 5 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Maintenance Tickets</h5>
                <div className="d-flex gap-2 position-relative w-35 w-md-100 w-sm-100">
                    <button 
                        className="btn btn-outline-secondary position-relative"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Icon icon="mdi:filter" width="20" height="20" />
                        {(selectedOpenedBy !== 'all' || selectedAssignedTo !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {(selectedOpenedBy !== 'all' ? 1 : 0) + (selectedAssignedTo !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                    {showFilters && (
                        <div className="position-absolute top-100 end-0 mt-2 p-3 bg-white border rounded shadow-sm" style={{ zIndex: 1000, minWidth: '250px' }}>
                            <div className="mb-3">
                                <label className="form-label">Opened By</label>
                                <select className="form-select" value={selectedOpenedBy} onChange={handleOpenedByChange}>
                                    <option value="all">All</option>
                                    {openedByOptions.map((model, idx) => (
                                        <option key={idx} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Assigned To</label>
                                <select className="form-select" value={selectedAssignedTo} onChange={handleAssignedToChange}>
                                    <option value="all">All</option>
                                    {assignedToOptions.map((name, idx) => (
                                        <option key={idx} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Priority</label>
                                <select className="form-select" value={selectedPriority} onChange={handlePriorityChange}>
                                    <option value="all">All</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={selectedStatus} onChange={handleStatusChange}>
                                    <option value="all">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-sm btn-secondary me-2" onClick={() => {
                                    setSelectedOpenedBy('all');
                                    setSelectedAssignedTo('all');
                                    setSelectedPriority('all');
                                    setSelectedStatus('all');
                                    setShowFilters(false);
                                }}>Clear</button>
                                <button className="btn btn-sm btn-primary" onClick={() => setShowFilters(false)}>Apply</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-35 w-md-100 w-sm-100">
                    <button
                        className="btn btn-success w-100 w-md-auto"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="ms-1">Create New Ticket</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {tickets.length === 0 ? (
                    <div className="text-center p-4">No tickets found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0" {...getTableProps()}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                {column.render('Header')}
                                                {' '}
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? <FaSortDown /> : <FaSortUp />
                                                ) : (
                                                    <FaSort style={{ opacity: 0.3 }} />
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {page.map(row => {
                                    prepareRow(row);
                                    const { key, ...rowProps } = row.getRowProps();
                                    return (
                                        <tr key={row.id} {...rowProps}>
                                            {row.cells.map(cell => {
                                                const cellProps = cell.getCellProps();
                                                const { key, ...rest } = cellProps;
                                                return (
                                                    <td key={key} {...rest} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center my-3 mx-5">
                <span>
                    Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
                </span>
                <div>
                    {pageOptions.map((option, index) => (
                        <button
                            key={index}
                            className={`btn btn-sm me-2 ${pageIndex === index ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => gotoPage(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reject Reason Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reject Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="rejectReason">
                            <Form.Label>Rejection Reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Enter rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject}>
                        Submit Rejection
                    </Button>
                </Modal.Footer>
            </Modal>

            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}

            {/* Create New Ticket Modal */}
            <CreateTicketModal
                show={showModal}
                handleClose={() => setShowModal(false)} // Close the modal
                fetchData={fetchData} // Pass fetchData to refresh the ticket list after creating a new ticket
                type="maintenance"
            />

            {/* Delete Modal */}
            {selectedTicketDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    id={selectedTicketDelete._id}
                    fetchData={fetchData}
                    title="Maintenance Ticket"
                    route="maintenance"
                />
            )}
        </div>
    );
};

export default MaintenanceLayer;