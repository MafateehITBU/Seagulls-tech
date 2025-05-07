import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateSparePartModal from './modals/SparePart/CreateSparePartModal.jsx';
import EditSparePartModal from './modals/SparePart/EditSparePartModal.jsx';
import DeleteModal from './modals/DeleteModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search spare parts..."
    />
);

const SparePartLayer = () => {
    const [spareParts, setSpareParts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSparePart, setSelectedSparePart] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedSparePartEdit, setSelectedSparePartEdit] = useState(null); // for Edit Modal
    const [selectedSparePartDelete, setSelectedSparePartDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/sparepart');
            setSpareParts(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (sparePart) => {
        setSelectedSparePartDelete(sparePart);
        setShowDeleteModal(true);
    };

    const closeModal = () => setSelectedSparePart(null);

    const columns = React.useMemo(() => [
        {
            Header: 'Part No',
            accessor: row => row.partNo || '#',
        },
        {
            Header: 'Name',
            accessor: row => row.partName || '-',
        },
        {
            Header: 'Vendor',
            accessor: row => row.vendorName,
        },
        {
            Header: 'Barcode',
            accessor: row => row.partBarcode || '-',
        },
        {
            Header: 'Quantity',
            accessor: row => row.quantity || '-',
        },
        {
            Header: 'Min. Stock',
            accessor: row => row.minStock,
        },
        {
            Header: 'Max. Stock',
            accessor: row => row.maxStock,
        },
        {
            Header: 'Expiry Date',
            accessor: row => new Date(row.expiryDate).toLocaleDateString(),
        },
        {
            Header: 'Lead Time',
            accessor: row => row.leadTime,
        },
        {
            Header: 'Storage Type',
            accessor: row => row.storageType,
            Cell: ({ row }) => {
                const status = row.original.storageType;
                return status !== 'cold' ? (
                    <span className='badge bg-success'>Regular</span>
                ) : (
                    <span className='badge bg-primary'>Cold</span>
                )
            },
        },
        {
            Header: 'Photo',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-warning"
                    onClick={() => setSelectedSparePart(row.original)}
                >
                    view
                </button>
            ),
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedSparePartEdit(row.original); setEditModalShow(true); }}
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
    } = useTable({ columns, data: spareParts }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Spare Parts</h5>
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
                        <span className="ms-1">Create New Spare Part</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {spareParts.length === 0 ? (
                    <div className="text-center p-4">No spare parts found</div>
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

            {/* Modal for Photo*/}
            {selectedSparePart && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Spare Part Photo</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body d-flex flex-column">
                                {selectedSparePart.photo ? (
                                    <img
                                        src={selectedSparePart.photo}
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

            {/* Create New Spare Part Modal */}
            <CreateSparePartModal
                show={showModal}
                handleClose={() => setShowModal(false)} // Close the modal
                fetchData={fetchData}
            />

            {/* Edit Spare Part Modal */}
            {selectedSparePartEdit && (<EditSparePartModal
                show={editModalShow}
                handleClose={() => setEditModalShow(false)}
                fetchData={fetchData}
                selectedSparePart={selectedSparePartEdit}
            />)}

            {/* Delete Modal */}
            {selectedSparePartDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    id={selectedSparePartDelete._id}
                    fetchData={fetchData}
                    title="Spare Part"
                    route="sparepart"
                />
            )}

        </div>
    );
};

export default SparePartLayer;