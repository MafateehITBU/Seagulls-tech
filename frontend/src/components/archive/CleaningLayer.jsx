import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import ReportModal from '../modals/ReportModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/ticket/closed-cleaning');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
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
            Header: 'Status',
            accessor: row => row.ticketId?.status,
            Cell: ({ row }) => {
                return (<span className="badge bg-success"> {row.original.ticketId.status}</span>)
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
                <h5 className='card-title mb-0'>Closed Cleaning Tickets</h5>

                <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
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

            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};

export default CleaningLayer;
