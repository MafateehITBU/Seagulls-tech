import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import AssetMoreInfoModal from '../modals/Technician/AssetMoreInfoModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Rejected Tickets..."
    />
);

const RejectedTicketsLayer = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [maintenanceRes, accidentRes, cleaningRes] = await Promise.all([
                axiosInstance.get('/maintenance/tech'),
                axiosInstance.get('/accident/tech'),
                axiosInstance.get('/cleaning/tech')
            ]);

            // Add "type" to each ticket
            const maintenance = maintenanceRes.data.map(ticket => ({ ...ticket, type: 'Maintenance' }));
            const accident = accidentRes.data.map(ticket => ({ ...ticket, type: 'Accident' }));
            const cleaning = cleaningRes.data.map(ticket => ({ ...ticket, type: 'Cleaning' }));

            // Combine all and filter rejected ones
            const allTickets = [...maintenance, ...accident, ...cleaning];
            const filtered = allTickets.filter(ticket => ticket.ticketId?.techTicketApprove === false);
            console.log('Rejected Tickets:', filtered);

            setTickets(filtered);
        } catch (error) {
            console.error('Error fetching rejected tickets:', error);
        }
    };

    const closeModal = () => setSelectedTicket(null);

    const columns = React.useMemo(() => [
        {
            Header: 'Type',
            accessor: 'type',
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
            Header: 'Reject Note',
            accessor: row => row.ticketId?.techApproveNote || '—',
        }
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
                <h5 className='card-title mb-0  flex-shrink-0 w-35 w-md-100 w-sm-100'>Rejected Tickets</h5>
                <div className="w-35 w-md-100 wd-sm-100">
                    <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
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

            {/* Asset Info Modal */}
            {selectedAsset && (
                <AssetMoreInfoModal
                    moreInfoAsset={selectedAsset}
                    closeModal={() => setSelectedAsset(null)}
                />
            )}

        </div>
    );
};

export default RejectedTicketsLayer;