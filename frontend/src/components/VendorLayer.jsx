import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateVendorModal from './modals/Vendor/CreateVendorModal.jsx';
import EditVendorModal from './modals/Vendor/EditVendorModal.jsx';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Vendor..."
    />
);

const VendorLayer = () => {
    const [vendors, setVendors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedVendorEdit, setSelectedVendorEdit] = useState(null); // for Edit Modal
    const [selectedVendorDelete, setSelectedVendorDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/vendor');
            setVendors(response.data.vendors);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (vendor) => {
        setSelectedVendorDelete(vendor);
        setShowDeleteModal(true);
    };

    const closeModal = () => setSelectedVendor(null);

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Name',
            accessor: row => row.name || '-',
        },
        {
            Header: 'Email',
            accessor: row => row.email || '-',
        },
        {
            Header: 'Phone',
            accessor: row => row.phone || '-',
        },
        {
            Header: 'Spare Parts',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedVendor(row.original)}
                >
                    see parts
                </button>
            ),
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedVendorEdit(row.original); setEditModalShow(true); }}
                    >
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.original)}
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
    } = useTable({ columns, data: vendors }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Vendors</h5>
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
                        onClick={() => setShowModal(true)}
                    >
                        <span className="ms-1">Create New Vendor</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {vendors.length === 0 ? (
                    <div className="text-center p-4">No vendors found</div>
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

            {/* Modal for Spare Parts Provided by the vendor */}
            {selectedVendor && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h6 className="modal-title">Spare Parts Provided by {selectedVendor.name}</h6>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {selectedVendor.spareParts && selectedVendor.spareParts.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered text-center">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className='text-center' style={{ whiteSpace: 'nowrap' }}>Part No</th>
                                                    <th className='text-center' style={{ whiteSpace: 'nowrap' }}>Part Name</th>
                                                    <th className='text-center' style={{ whiteSpace: 'nowrap' }}>Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedVendor.spareParts.map((part) => (
                                                    <tr key={part._id}>
                                                        <td style={{ whiteSpace: 'nowrap' }}>{part.partNo || '-'}</td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>{part.partName || '-'}</td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>{part.quantity ?? '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center">No spare parts available for this vendor.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Asset Modal */}
            <CreateVendorModal
                show={showModal}
                handleClose={() => setShowModal(false)} // Close the modal
                fetchData={fetchData}
            />

            {/* Edit Asset Modal */}
            {selectedVendorEdit && (<EditVendorModal
                show={editModalShow}
                handleClose={() => setEditModalShow(false)}
                fetchData={fetchData}
                selectedVendor={selectedVendorEdit}
            />)}

            {/* Delete Modal */}
            {selectedVendorDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    id={selectedVendorDelete._id}
                    fetchData={fetchData}
                    title="Vendor"
                    route="vendor"
                />
            )}
        </div>
    );
};

export default VendorLayer;