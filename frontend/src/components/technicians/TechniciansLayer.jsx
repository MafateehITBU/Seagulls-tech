import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import axiosInstance from "../../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import TechnicianModal from './TechnicianModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-25"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search technicians..."
        style={{ marginBottom: '15px' }}
    />
);

const TechniciansLayer = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const response = await axiosInstance.get('/tech');
            setTechnicians(response.data.techs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching technicians:', error);
            toast.error('Failed to fetch technicians');
            setLoading(false);
        }
    };

    const validateForm = (data) => {
        const errors = {};
        
        // Name validation
        if (!data.name || data.name.trim() === '') {
            errors.name = 'Name is required';
        }

        // Email validation
        if (!data.email || data.email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format';
        }

        // Phone validation
        if (!data.phone || data.phone.trim() === '') {
            errors.phone = 'Phone number is required';
        } else if (!/^07[7-9]\d{7}$/.test(data.phone)) {
            errors.phone = 'Phone must start with 07 followed by 7,8, or 9 and 7 digits';
        }

        // Password validation (only for new technicians)
        if (data.password && data.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // DOB validation
        if (!data.dob) {
            errors.dob = 'Date of birth is required';
        }

        return errors;
    };

    const handleAddTechnician = () => {
        setSelectedTechnician(null);
        setShowModal(true);
    };

    const handleUpdateTechnician = (technician) => {
        setSelectedTechnician(technician);
        setShowModal(true);
    };

    const handleDeleteTechnician = async (technicianId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'border-radius-12',
                title: 'text-warning',
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            }
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.delete(`/tech/${technicianId}`);
                toast.success('Technician deleted successfully');
                fetchTechnicians();
            } catch (error) {
                console.error('Error deleting technician:', error);
                toast.error('Failed to delete technician');
            }
        }
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
                        onClick={() => handleDeleteTechnician(row.original._id)}
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
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className='card-title mb-0'>Technicians</h5>
                <div className="d-flex align-items-center">
                    <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
                    <button
                        className="btn btn-success ml-3"
                        onClick={handleAddTechnician}
                    >
                        + Add New Technician
                    </button>
                </div>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : technicians.length === 0 ? (
                    <div className="text-center">No technicians found</div>
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

            <TechnicianModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                technician={selectedTechnician}
                fetchTechnicians={fetchTechnicians}
            />
        </div>
    );
};

export default TechniciansLayer; 