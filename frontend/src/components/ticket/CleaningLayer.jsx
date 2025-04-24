import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import axiosInstance from "../../axiosConfig";
import ReportModal from '../../components/ReportModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateTicketModal from './CreateCleaningTicketModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-25"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search tickets..."
        style={{ marginBottom: '15px' }}
    />
);

const CleaningLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/ticket/cleaning-tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (cleaningId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.delete(`/cleaning/${cleaningId}`);
                setTickets(prev => prev.filter(t => t._id !== cleaningId));
                toast.success('Ticket deleted successfully!', { position: "top-right" });
            } catch (error) {
                toast.error('Failed to delete the ticket.', { position: "top-right" });
            }
        }
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

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Opened By',
            accessor: row => row.ticketId?.openedBy?.name || 'N/A',
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
        },
        {
            Header: 'Created At',
            accessor: row => new Date(row.ticketId?.createdAt).toLocaleDateString(),
        },
        {
            Header: 'Approved',
            accessor: row => row.ticketId?.approved,
            Cell: ({ value }) => (
                <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                    {value ? 'Approved' : 'Not Approved'}
                </span>
            ),
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
            Header: 'Delete',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(row.original._id)}
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
        rows,
        prepareRow,
        setGlobalFilter,
        state,
    } = useTable({ columns, data: tickets }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className='card-title mb-0'>Cleaning Tickets</h5>

                <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
                <button
                    className="btn btn-success ml-3"
                    onClick={() => setShowModal(true)} // Show modal on button click
                >
                    + Create New Ticket
                </button>

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
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
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
                                                <td {...cell.getCellProps()}>
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
            />
        </div>
    );
};

export default CleaningLayer;
