import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import axiosInstance from "../axiosConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

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

    const handleAddTechnician = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Technician',
            html:
                '<input id="name" class="swal2-input" placeholder="Name">' +
                '<input id="email" class="swal2-input" placeholder="Email">' +
                '<input id="password" class="swal2-input" placeholder="Password" type="password">' +
                '<input id="phone" class="swal2-input" placeholder="Phone">' +
                '<input id="dob" class="swal2-input" type="date">' +
                '<input id="profilePic" class="swal2-input" type="file" accept="image/*">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Add',
            preConfirm: () => {
                const formData = new FormData();
                formData.append('name', document.getElementById('name').value);
                formData.append('email', document.getElementById('email').value);
                formData.append('password', document.getElementById('password').value);
                formData.append('phone', document.getElementById('phone').value);
                formData.append('dob', document.getElementById('dob').value);
                const file = document.getElementById('profilePic').files[0];
                if (file) {
                    formData.append('profilePic', file);
                }
                return formData;
            }
        });

        if (formValues) {
            try {
                const errors = validateForm({
                    name: formValues.get('name'),
                    email: formValues.get('email'),
                    password: formValues.get('password'),
                    phone: formValues.get('phone'),
                    dob: formValues.get('dob')
                });

                if (Object.keys(errors).length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: Object.values(errors).join('\n')
                    });
                    return;
                }

                await axiosInstance.post('/tech/add', formValues, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Technician added successfully');
                fetchTechnicians();
            } catch (error) {
                console.error('Error adding technician:', error);
                toast.error('Failed to add technician');
            }
        }
    };

    const handleUpdateTechnician = async (technician) => {
        const { value: formValues } = await Swal.fire({
            title: 'Update Technician',
            html:
                `<input id="name" class="swal2-input" placeholder="Name" value="${technician.name}">` +
                `<input id="email" class="swal2-input" placeholder="Email" value="${technician.email}">` +
                `<input id="phone" class="swal2-input" placeholder="Phone" value="${technician.phone}">` +
                `<input id="dob" class="swal2-input" type="date" value="${new Date(technician.dob).toISOString().split('T')[0]}">` +
                '<input id="profilePic" class="swal2-input" type="file" accept="image/*">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: () => {
                const formData = new FormData();
                formData.append('name', document.getElementById('name').value);
                formData.append('email', document.getElementById('email').value);
                formData.append('phone', document.getElementById('phone').value);
                formData.append('dob', document.getElementById('dob').value);
                const file = document.getElementById('profilePic').files[0];
                if (file) {
                    formData.append('profilePic', file);
                }
                return formData;
            }
        });

        if (formValues) {
            try {
                const errors = validateForm({
                    name: formValues.get('name'),
                    email: formValues.get('email'),
                    phone: formValues.get('phone'),
                    dob: formValues.get('dob')
                });

                if (Object.keys(errors).length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: Object.values(errors).join('\n')
                    });
                    return;
                }

                await axiosInstance.put(`/tech/${technician._id}`, formValues, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Technician updated successfully');
                fetchTechnicians();
            } catch (error) {
                console.error('Error updating technician:', error);
                toast.error('Failed to update technician');
            }
        }
    };

    const handleDeleteTechnician = async (technicianId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
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
        </div>
    );
};

export default TechniciansLayer;