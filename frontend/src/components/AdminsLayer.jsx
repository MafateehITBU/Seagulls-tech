import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateAdminModal from './modals/Admin/CreateAdminModal';
import EditAdminModal from './modals/Admin/EditAdminModal';
import DeleteAdminModal from './modals/Admin/DeleteAdminModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Admin..."
    />
);

const AdminsLayer = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axiosInstance.get('/admin');
            setAdmins(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to fetch admins');
            setLoading(false);
        }
    };

    const handleEditClick = (admin) => {
        setSelectedAdmin(admin);
        setShowEditModal(true);
    };

    const handleDeleteClick = (admin) => {
        setSelectedAdmin(admin);
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
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=Admin&size=128';
                    }}
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
            Header: 'Bio',
            accessor: 'bio',
        },
        {
            Header: 'Position',
            accessor: 'position',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'superadmin' ? 'bg-primary' : 'bg-secondary'}`}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditClick(row.original)}
                    >
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteClick(row.original)}
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
    } = useTable({ columns, data: admins }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Admins</h5>
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
                        onClick={() => setShowCreateModal(true)}
                    >
                        
                        <span className="ms-1">Add New Admin</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : admins.length === 0 ? (
                    <div className="text-center p-4">No admins found</div>
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

            <CreateAdminModal
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                fetchAdmins={fetchAdmins}
            />

            <EditAdminModal
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                fetchAdmins={fetchAdmins}
                selectedAdmin={selectedAdmin}
            />

            <DeleteAdminModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                admin={selectedAdmin}
                fetchAdmins={fetchAdmins}
            />
        </div>
    );
};

export default AdminsLayer; 