import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import AddTechnicianModal from './modals/Tech/AddTechnicianModal';
import UpdateTechnicianModal from './modals/Tech/UpdateTechnicianModal';
import DeleteTechnicianModal from './modals/Tech/DeleteTechnicianModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Technician..."
    />
);

const TechniciansLayer = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const [techsRes, ticketsRes] = await Promise.all([
                axiosInstance.get('/tech'),
                axiosInstance.get('/ticket/tech')
            ]);

            const ticketCounts = ticketsRes.data;

            const mergedData = techsRes.data.techs.map(tech => {
                const match = ticketCounts.find(ticket => ticket.id === tech._id);
                return {
                    ...tech,
                    closedTicketsCount: match ? match.closedTicketsCount : 0
                };
            });

            setTechnicians(mergedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleAddTechnician = () => {
        setShowAddModal(true);
    };

    const handleUpdateTechnician = (technician) => {
        setSelectedTechnician(technician);
        setShowUpdateModal(true);
    };

    const handleDeleteTechnician = (technician) => {
        setSelectedTechnician(technician);
        setShowDeleteModal(true);
    };

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Photo',
            accessor: 'photo',
            Cell: ({ value }) => (
                <img
                    src={value}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
            ),
        },
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Phone',
            accessor: 'phone',
        },
        {
            Header: 'Date of Birth',
            accessor: 'dob',
            Cell: ({ value }) => new Date(value).toLocaleDateString(),
        },
        {
            Header: 'Closed Tickets',
            accessor: 'closedTicketsCount',
            Cell: ({ value }) => <span>{value}</span>,
        },        
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateTechnician(row.original)}
                    >
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteTechnician(row.original)}
                    >
                        <Icon icon="mdi:delete" />
                    </button>
                </div>
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
    } = useTable({ columns, data: technicians }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Technicians</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter
                        globalFilter={state.globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        className="form-control"
                    />
                </div>
                <div className="w-35 w-md-100 w-sm-100">
                    <button
                        className="btn btn-success w-100 w-md-auto"
                        onClick={handleAddTechnician}
                    >

                        <span className="ms-1">Add New Technician</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : technicians.length === 0 ? (
                    <div className="text-center p-4">No technicians found</div>
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
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                const { key, ...cellProps } = cell.getCellProps();
                                                return (
                                                    <td key={key} {...cellProps} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
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

            <AddTechnicianModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                fetchTechnicians={fetchTechnicians}
            />

            <UpdateTechnicianModal
                show={showUpdateModal}
                handleClose={() => setShowUpdateModal(false)}
                technician={selectedTechnician}
                fetchTechnicians={fetchTechnicians}
            />

            <DeleteTechnicianModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                technician={selectedTechnician}
                fetchTechnicians={fetchTechnicians}
            />
        </div>
    );
};

export default TechniciansLayer; 