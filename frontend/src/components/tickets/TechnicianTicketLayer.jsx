import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-30"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Tickets..."
    />
);

const TechnicianTicketLayer = () => {
    const [tickets, setTickets] = useState([]);

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
                    .filter(ticket => ticket.ticketId?.techTicketApprove === false)
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

    const handleApprove = async (ticket) => {
        try {
            const { type, _id } = ticket;

            const endpoint = `/${type}/approve/${_id}`;
            await axiosInstance.put(endpoint);

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ticket approved successfully`);

            // Refresh the list after approval
            fetchData();
        } catch (error) {
            console.error(`Failed to approve ${ticket.type} ticket:`, error);
            toast.error("Approval failed. Please try again.");
        }
    };

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
            Header: 'Approve',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleApprove(row.original)}
                >
                    <Icon icon="mdi:thumb-up" />
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
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className='card-title mb-0'>Technician Tickets</h5>

                <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
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
        </div>
    );
};

export default TechnicianTicketLayer;
