import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateTicketModal from '../modals/Technician/CreateCleaningTicketModal';
import AssetMoreInfoModal from '../modals/Technician/AssetMoreInfoModal';
import AddReportModal from '../modals/Technician/AddReportModal';
import ReportEditModal from '../modals/Technician/ReportEditModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Cleaning Tickets..."
    />
);

const TechCleaningLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedCleaningId, setSelectedCleaningId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/cleaning/tech');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleStart = async (cleaningId) => {
        if (!cleaningId?.ticketId?.techTicketApprove) {
           return toast.error('Wait for admin approval to start the ticket!', { position: "top-right" });
        }
        try {
            await axiosInstance.post(`/cleaning/tech/start/${cleaningId}`);
            fetchData();
            toast.success('Ticket Started successfully!', { position: "top-right" });
        } catch (error) {
            toast.error('Failed to start the ticket.', { position: "top-right" });
        }
    }

    const handleAddReport = (cleaningId) => {
        setSelectedCleaningId(cleaningId);
        setShowReportModal(true);
    };

    const handleCloseTicket = async (cleaningId) => {
        try {
            await axiosInstance.post(`/cleaning/tech/close/${cleaningId}`);
            setTickets(prev => prev.filter(c => c._id !== cleaningId));
            toast.success('Ticket Closed successfully!', { position: "top-right" });
        } catch (error) {
            toast.error('Failed to close the ticket.', { position: "top-right" });
        }
    }

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
                        onClick={() => handleStart(row.original._id)}
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
            Header: 'Report',
            accessor: row => row.reportId,
            Cell: ({ row }) => {
                const report = row.original.reportId;
                const cleaningId = row.original._id;
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
                        className='btn btn-sm btn-primary'
                        onClick={() => {
                            if (!startTime) {
                                toast.warn('Start Ticket!', { position: "top-right" });
                                return;
                            }
                            handleAddReport(cleaningId);
                        }}
                    >
                        Add
                    </button>
                );
            },
        },
        {
            Header: 'Close',
            Cell: ({ row }) => {
                const report = row.original.reportId?._id;

                if (report) {
                    return (
                        <button
                            className='btn btn-sm btn-danger'
                            onClick={() => handleCloseTicket(row.original._id)}
                        >
                            Close
                        </button>
                    );
                }

                return <span>Attach a report!</span>;
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
                <h5 className='card-title mb-0  flex-shrink-0 w-35 w-md-100 w-sm-100'>Cleaning Tickets</h5>
                <div className="w-35 w-md-100 wd-sm-100">
                <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />                </div>

                <div className="w-35 w-md-100 w-sm-100">
                <button
                    className="btn btn-success ml-3"
                    onClick={() => setShowModal(true)}
                >
                Create New Ticket
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
            />

            {/* Asset Info Modal */}
            {selectedAsset && (
                <AssetMoreInfoModal
                    moreInfoAsset={selectedAsset}
                    closeModal={() => setSelectedAsset(null)}
                />
            )}

            {/* Add Report Modal */}
            <AddReportModal
                show={showReportModal}
                handleClose={() => setShowReportModal(false)}
                Id={selectedCleaningId}
                fetchData={fetchData}
                type='cleaning'
                route='tech'
            />

            {/* Report Edit Modal */}
            {selectedReport && (
                <ReportEditModal
                    report={selectedReport}
                    closeModal={() => setSelectedReport(null)}
                    status={status}
                    fetchData={fetchData}
                />
            )}
        </div>
    );
};

export default TechCleaningLayer;