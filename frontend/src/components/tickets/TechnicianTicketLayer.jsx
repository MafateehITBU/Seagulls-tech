import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Tickets..."
    />
);

const TechnicianTicketLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [ticketToApprove, setTicketToApprove] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cleaningRes, maintenanceRes, accidentRes] = await Promise.all([
                axiosInstance.get('/ticket/cleaning-tickets'),
                axiosInstance.get('/ticket/maintenance-tickets'),
                axiosInstance.get('/ticket/accident-tickets'),
            ]);

            const filterUnapproved = (data, type) => {
                if (!Array.isArray(data)) return [];
                return data
                    .filter(ticket => ticket.ticketId?.techTicketApprove === null)
                    .map(ticket => ({ ...ticket, type }));
            };

            const allTickets = [
                ...filterUnapproved(cleaningRes.data, 'cleaning'),
                ...filterUnapproved(maintenanceRes.data, 'maintenance'),
                ...filterUnapproved(accidentRes.data, 'accident'),
            ];

            setTickets(allTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error("Failed to fetch tickets.");
        }
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
    };

    const handlePriorityChange = (e) => {
        setSelectedPriority(e.target.value);
    };

    const filteredData = React.useMemo(() => {
        return tickets.filter(ticket => {
            const typeMatch = selectedType === 'all' || ticket.type === selectedType;
            const priorityMatch = selectedPriority === 'all' || ticket.ticketId?.priority === selectedPriority;
            return typeMatch && priorityMatch;
        });
    }, [tickets, selectedType, selectedPriority]);

    const openNoteModal = (ticket, approval) => {
        setTicketToApprove(ticket);
        setApprovalStatus(approval);
        setNoteText(''); // Reset the note
        setShowNoteModal(true);
    };

    const handleApprove = async (ticket, techApproveNote) => {
        try {
            const { type, _id } = ticket;

            const endpoint = `/${type}/approve/${_id}`;
            await axiosInstance.put(endpoint, { techTicketApprove: approvalStatus, techApproveNote });

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ticket approved successfully`);

            // Refresh the list after approval
            fetchData();
        } catch (error) {
            console.error(`Failed to approve ${ticket.type} ticket:`, error);
            toast.error("Approval failed. Please try again.");
        }
    };
    const closeModal = () => setSelectedTicket(null);

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Type',
            accessor: row => row.type,
        },
        {
            Header: 'Opened By',
            accessor: row => row.ticketId?.openedBy?.name || 'System',
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
            Header: 'Asset',
            accessor: row => row.ticketId?.assetId?.assetName || 'Unknown',
        },
        {
            Header: 'Description',
            accessor: row => row.ticketId?.description,
            Cell: ({ value }) => <div style={{ width: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{value}</div>,
        },
        {
            Header: 'Spare Parts',
            accessor: row => row?.spareParts || '—',
            Cell: ({ value }) => <div style={{ width: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{value}</div>,
        },
        {
            Header: 'Photo',
            accessor: row => row.ticketId?.photo,
            Cell: ({ value }) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        setSelectedTicket({ ...selectedTicket, photo: value });
                        setShowModal(true);
                    }}
                >
                    View
                </button>
            ),
        },
        {
            Header: 'Created At',
            accessor: row => new Date(row.ticketId?.createdAt).toLocaleDateString(),
        },
        {
            Header: 'Approve',
            Cell: ({ row }) => (
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
                            <button className="dropdown-item" onClick={() => openNoteModal(row.original, true, noteText)}>
                                Approve
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={() => openNoteModal(row.original, false, noteText)}>
                                Reject
                            </button>
                        </li>
                    </ul>
                </div>
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
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className='card-title mb-0'>Technician Tickets</h5>
                <div className="d-flex gap-2 position-relative">
                    <button
                        className="btn btn-outline-secondary position-relative"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Icon icon="mdi:filter" width="20" height="20" />
                        {(selectedType !== 'all' || selectedPriority !== 'all') && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {(selectedType !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
                    {showFilters && (
                        <div className="position-absolute top-100 end-0 mt-2 p-3 bg-white border rounded shadow-sm" style={{ zIndex: 1000, minWidth: '250px' }}>
                            <div className="mb-3">
                                <label className="form-label">Type</label>
                                <select
                                    className="form-select"
                                    value={selectedType}
                                    onChange={handleTypeChange}
                                >
                                    <option value="all">All Types</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="accident">Accident</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-select"
                                    value={selectedPriority}
                                    onChange={handlePriorityChange}
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn btn-sm btn-secondary me-2"
                                    onClick={() => {
                                        setSelectedType('all');
                                        setSelectedPriority('all');
                                        setShowFilters(false);
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
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

            {showNoteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Note for Approval</h5>
                                <button type="button" className="btn-close" onClick={() => setShowNoteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Enter your note here..."
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleApprove(ticketToApprove, noteText);
                                        setShowNoteModal(false);
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Photo*/}
            {selectedTicket && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Photo</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body d-flex flex-column">
                                {selectedTicket.photo ? (
                                    <img
                                        src={selectedTicket.photo}
                                        alt="Asset"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                                        className='align-self-center'
                                    />
                                ) : (
                                    <div>No photo available.</div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianTicketLayer;
