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
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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
            accessor: row => row.ticketId?.openedBy?.name || 'N/A',
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
            Header: 'Spare Parts',
            accessor: row => row?.spareParts || '—',
            Cell: ({ value }) => <div style={{ width: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{value}</div>,
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
        { columns, data: tickets, initialState: { pageSize: 5 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Maintenance Tickets</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        className="form-control"
                    />
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