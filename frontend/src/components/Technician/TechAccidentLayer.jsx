import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateTicketModal from '../modals/Technician/CreateTicketModal';
import AssetMoreInfoModal from '../modals/Technician/AssetMoreInfoModal';
import SparePartsModal from '../modals/Technician/SparePartsModal.jsx';
import AddReportModal from '../modals/Technician/AddReportModal';
import ReportEditModal from '../modals/Technician/ReportEditModal';
import AddCrocaModal from '../modals/Technician/addCrocaModal';
import CrocaReportModal from '../modals/Accident/CrocaReportModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Accident Tickets..."
    />
);

const TechAccidentLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showAddCrocaModal, setShowAddCrocaModal] = useState(false);
    const [selectedCroca, setSelectedCroca] = useState(null);
    const [showCroca, setShowCroca] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRejectAccidentId, setSelectedRejectAccidentId] = useState(null);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedSpareParts, setSelectedSpareParts] = useState(null);
    const [requireSpareParts, setRequireSpareParts] = useState(false);
    const [showSparePartsModal, setShowSparePartsModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedAccidentId, setSelectedAccidentId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/accident/tech');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleStart = async (accident) => {
        console.log("Trying to start ticket:", accident);
        if (!accident?.ticketId?.techTicketApprove) {
            return toast.error('Wait for admin approval to start the ticket!', { position: "top-right" });
        }
        try {
            await axiosInstance.post(`/accident/tech/start/${accident._id}`);
            fetchData();
            toast.success('Ticket Started successfully!', { position: "top-right" });
        } catch (error) {
            toast.error('Failed to start the ticket.', { position: "top-right" });
        }
    }

    const handleAddReport = (accidentId) => {
        setSelectedAccidentId(accidentId);
        setShowReportModal(true);
    };

    const handleAddRejectReport = (accidentId) => {
        setSelectedRejectAccidentId(accidentId);
        setShowRejectModal(true);
    };

    const handleCloseTicket = async (accidentId) => {
        try {
            await axiosInstance.post(`/accident/tech/close/${accidentId}`);
            setTickets(prev => prev.filter(c => c._id !== accidentId));
            toast.success('Ticket Closed successfully!', { position: "top-right" });
        } catch (error) {
            toast.error('Failed to close the ticket.', { position: "top-right" });
        }
    };

    const handleShowSpareParts = (accidentId, spareParts, requireSpareParts) => {
        setSelectedAccidentId(accidentId);
        setSelectedSpareParts(spareParts);
        setRequireSpareParts(requireSpareParts);
        setShowSparePartsModal(true);
    };

    const columns = React.useMemo(() => [
        {
            Header: 'Start',
            Cell: ({ row }) => {
                const startTime = row.original.ticketId?.startTime;

                if (startTime) {
                    const time = new Date(startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                    return <span>{time}</span>;
                }

                return (
                    <button
                        className='btn btn-sm btn-primary'
                        onClick={() => handleStart(row.original)}
                    >
                        Start
                    </button>
                );
            },
        },
        {
            Header: 'Asset Info.',
            accessor: row => row.original?.ticketId?.assetId || 'Unknown Asset',
            Cell: ({ row }) => {
                const asset = row.original.ticketId.assetId;
                return asset ? (
                    <span className='btn btn-sm btn-primary' onClick={() => setSelectedAsset(asset)}>
                        View
                    </span>
                ) : '—';
            },
        },
        {
            Header: 'Description',
            accessor: row => row.ticketId?.description,
        },
        {
            Header: 'Priority',
            accessor: row => row.ticketId?.priority,
            Cell: ({ value }) => (
                <span className={`badge ${value === 'High' ? 'bg-danger' : value === 'Medium' ? 'bg-warning' : 'bg-secondary'}`}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Spare Parts',
            accessor: row => row?.spareParts,
            Cell: ({ row }) => {
                const spareParts = row.original.spareParts;
                const requireSpareParts = row.original.requireSpareParts;
                const accidentId = row.original._id;

                return spareParts ? (
                    <span className='btn btn-sm btn-primary' onClick={() => handleShowSpareParts( accidentId ,spareParts, requireSpareParts)}>
                        View
                    </span>
                ) : '—';
            },
        },
        {
            Header: 'Report',
            accessor: row => row.reportId,
            Cell: ({ row }) => {
                const report = row.original.reportId;
                const accidentId = row.original._id;
                const startTime = row.original.ticketId?.startTime;

                if (report) {
                    return (
                        <span style={{ cursor: 'pointer' }} onClick={() => {
                            setSelectedReport(report);
                            setStatus(row.original.status);
                        }}>
                            <Icon icon="mdi:clipboard-text" />
                        </span>
                    );
                }

                return (
                    <button
                        className='btn btn-sm btn-success'
                        onClick={() => {
                            if (!startTime) {
                                toast.warn('Start Ticket!', { position: "top-right" });
                                return;
                            }
                            handleAddReport(accidentId);
                        }}
                    >
                        Add
                    </button>
                );
            },
        },
        {
            Header: 'Croca',
            accessor: row => row.croca,
            Cell: ({ row }) => {
                const croca = row.original.croca;
                const accidentId = row.original._id;

                // Check if croca exists and is still default
                const isCrocaDefault = croca &&
                    croca.crocaType === 'Croca' &&
                    croca.cost === '0' &&
                    croca.photo === null;

                if (isCrocaDefault) {
                    return (
                        <button
                            className='btn btn-sm btn-success'
                            onClick={() => {
                                setSelectedAccidentId(accidentId);
                                setShowAddCrocaModal(true);
                            }}
                        >
                            Add
                        </button>
                    );
                }

                return <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setSelectedCroca(croca);
                        setShowCroca(true);
                    }}
                >
                    <Icon icon="mdi:clipboard-text" />
                </span>;
            },
        },
        {
            Header: 'Approved',
            accessor: row => row.ticketId?.approved,
            Cell: ({ row }) => {
                const ticket = row.original.ticketId;
                const approved = ticket?.approved;

                if (approved === null || approved === undefined) {
                    return '-';
                }

                if (approved === true) {
                    return <span className='badge bg-success'>Approved</span>;
                }

                // If false (rejected)
                return (
                    <div className='d-flex flex-column'>
                        <div className='badge bg-danger'>Rejected</div>
                        <div>{ticket?.rejectionReason || '-'}</div>
                    </div>
                );
            }
        },
        {
            Header: 'Reject Report',
            accessor: row => row.rejectReportId,
            Cell: ({ row }) => {
                const report = row.original.rejectReportId;
                const accidentId = row.original._id;
                const ticket = row.original.ticketId;
                const approved = ticket?.approved;

                if (approved === null || approved === undefined || (approved && !report)) {
                    return '-';
                }

                // If false (rejected)
                if (!approved && !report) {
                    return (
                        <button
                            className='btn btn-sm btn-primary'
                            onClick={() => {
                                handleAddRejectReport(accidentId);
                            }}
                        >
                            Add
                        </button>
                    );
                }

                return (
                    <span style={{ cursor: 'pointer' }} onClick={() => {
                        setSelectedReport(report);
                        setStatus(row.original.status);
                    }}>
                        <Icon icon="mdi:clipboard-text" />
                    </span>
                );
            },
        },
        {
            Header: 'Close',
            Cell: ({ row }) => {
                const report = row.original.reportId?._id;

                if (!report) {
                    return <span>Attach a report!</span>;
                } else if (!row.original.ticketId?.approved) {
                    return <span>Wait for Admin approval</span>
                }

                return (
                    <button
                        className='btn btn-sm btn-danger'
                        onClick={() => handleCloseTicket(row.original._id)}
                    >
                        Close
                    </button>
                );
            },
        },
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter,
        state,
    } = useTable({ columns, data: tickets }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0  flex-shrink-0 w-35 w-md-100 w-sm-100'>Accident Tickets</h5>
                <div className="w-35 w-md-100 wd-sm-100">
                    <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>

                <div className="w-35 w-md-100 w-sm-100">
                    <button
                        className="btn btn-success ml-3"
                        onClick={() => setShowModal(true)}
                    >
                        + Create New Ticket
                    </button>
                </div>
            </div>
            <div className="card-body">
                {tickets.length === 0 ? (
                    <div className="text-center">No tickets found</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table bordered-table mb-0" {...getTableProps()}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center' }}>
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
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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

            {/* Create New Ticket Modal */}
            <CreateTicketModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                fetchData={fetchData}
                type="accident"
            />

            {/* Asset Info Modal */}
            {selectedAsset && (
                <AssetMoreInfoModal
                    moreInfoAsset={selectedAsset}
                    closeModal={() => setSelectedAsset(null)}
                />
            )}

            {/* Spare Parts Modal */}
            {showSparePartsModal && (
                <SparePartsModal
                    show={showSparePartsModal}
                    closeModal={() => setShowSparePartsModal(false)}
                    ID={selectedAccidentId}
                    spareParts={selectedSpareParts}
                    requireSpareParts={requireSpareParts}
                    route="accident"
                    fetchData={fetchData}
                />
            )}

            {/* Add Report Modal */}
            <AddReportModal
                show={showReportModal}
                handleClose={() => setShowReportModal(false)}
                Id={selectedAccidentId}
                fetchData={fetchData}
                type="accident"
                route="tech"
            />

            {/* Add Croca Modal */}
            {showAddCrocaModal && (
                <AddCrocaModal
                    show={showAddCrocaModal}
                    handleClose={() => setShowAddCrocaModal(false)}
                    accidentId={selectedAccidentId}
                    fetchData={fetchData}
                />
            )}

            {showCroca && (
                <CrocaReportModal
                    croca={selectedCroca}
                    onClose={() => setShowCroca(false)}
                />
            )}

            {/* Report Edit Modal */}
            {selectedReport && (
                <ReportEditModal
                    report={selectedReport}
                    closeModal={() => setSelectedReport(null)}
                    status={status}
                    fetchData={fetchData}
                />
            )}

            {showRejectModal && (
                <AddReportModal
                    show={showRejectModal}
                    handleClose={() => setShowRejectModal(false)}
                    Id={selectedRejectAccidentId}
                    fetchData={fetchData}
                    type="accident"
                    route="tech/reject"
                />
            )}
        </div>
    );
};

export default TechAccidentLayer;