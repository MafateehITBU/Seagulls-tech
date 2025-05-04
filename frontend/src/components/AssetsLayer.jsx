import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateAssetModal from './modals/Asset/CreateAssetModal';
import EditAssetModal from './modals/Asset/EditAssetModal';
import DeleteModal from './modals/DeleteModal';
import { useNavigate } from 'react-router-dom';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Assets..."
    />
);

const AssetsLayer = () => {
    const [assets, setAssets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [moreInfoAsset, setMoreInfoAsset] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false); // QR modal state
    const [qrCode, setQRCode] = useState(null); // Store selected QR code
    const [selectedAssetEdit, setSelectedAssetEdit] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedAssetDelete, setSelectedAssetDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/asset');
            setAssets(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (asset) => {
        setSelectedAssetDelete(asset);
        setShowDeleteModal(true);
    };

    const closeModal = () => setMoreInfoAsset(null);

    const handleQRClick = (asset) => {
        setQRCode(asset.qrCode);  // Set the QR code image
        setSelectedAsset(asset);  // Set selected asset for navigation
        setShowQRModal(true);     // Show the modal
    };

    const columns = React.useMemo(() => [
        {
            Header: 'Asset No',
            accessor: row => row.assetNo || '#',
        },
        {
            Header: 'Name',
            accessor: row => row.assetName || '-',
        },
        {
            Header: 'Type',
            accessor: row => row.assetType || '-',
        },
        {
            Header: 'SubType',
            accessor: row => row.assetSubType || '-',
        },
        {
            Header: 'Status',
            accessor: row => row.assetStatus,
            Cell: ({ row }) => {
                const status = row.original.assetStatus;
                return status !== 'Active' ? (
                    <span className='badge bg-warning'>Inactive</span>
                ) : (
                    <span className='badge bg-success'>Active</span>
                )
            },
        },
        {
            Header: 'Quantity',
            accessor: row => row.quantity,
        },
        {
            Header: 'Cleaning Schedule',
            accessor: row => row.cleaningSchedule,
            Cell: ({ row }) => {
                const cleaningSchedule = row.original.cleaningSchedule;
                if (!cleaningSchedule) return <div>No schedule</div>;

                const intervalInDays = cleaningSchedule.intervalInDays;
                const nextCleaningDate = new Date(cleaningSchedule.nextCleaningDate).toLocaleDateString();

                return (
                    <div>
                        <div>Next Cleaning Date: <b>{nextCleaningDate}</b></div>
                        <div>Cleaning every <b>{intervalInDays}</b> days</div>
                    </div>
                );
            }
        },
        {
            Header: 'Maintenance Schedule',
            accessor: row => row.maintenanceSchedule,
            Cell: ({ row }) => {
                const maintenanceSchedule = row.original.maintenanceSchedule;
                if (!maintenanceSchedule) return <div>No schedule</div>;

                const intervalInDays = maintenanceSchedule.intervalInDays;
                const nextMaintenanceDate = new Date(maintenanceSchedule.nextMaintenanceDate).toLocaleDateString();

                return (
                    <div>
                        <div>Next Maintenance Date: <b>{nextMaintenanceDate}</b></div>
                        <div>Maintain every <b>{intervalInDays}</b> days</div>
                    </div>
                );
            }
        },
        {
            Header: 'QR Code',
            accessor: row => row.qrCode,
            Cell: ({ row }) => {
                const qrCode = row.original.qrCode;
                return qrCode ? (
                    <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleQRClick(row.original)} // Handle QR click
                    >
                        View QR Code
                    </button>
                ) : (
                    <div>No QR Code</div>
                );
            }
        },
        {
            Header: 'More Info',
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-warning"
                    onClick={() => setMoreInfoAsset(row.original)}
                >
                    More Info
                </button>
            ),
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                            setSelectedAssetEdit(row.original);
                            setEditModalShow(true);
                        }}
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
    } = useTable({ columns, data: assets }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <h5 className='card-title mb-0'>Assets</h5>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 w-100 w-md-auto">
                        <GlobalFilter 
                            globalFilter={state.globalFilter} 
                            setGlobalFilter={setGlobalFilter} 
                            className="w-100 w-md-auto"
                        />
                        <button
                            className="btn btn-success w-100 w-md-auto"
                            onClick={() => setShowModal(true)}
                        >
                            <Icon icon="mdi:plus" />
                            <span className="ms-1">Create New Asset</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                {assets.length === 0 ? (
                    <div className="text-center p-4">No assets found</div>
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

            {/* Modal for More Info */}
            {moreInfoAsset && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Asset Info</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body d-flex flex-column">
                                <p><strong>Location:</strong> {moreInfoAsset.location}</p>
                                <p><strong>Installation Date:</strong> {new Date(moreInfoAsset.installationDate).toLocaleDateString()}</p>
                                {moreInfoAsset.photo ? (
                                    <img
                                        src={moreInfoAsset.photo}
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

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">QR Code</h5>
                                <button type="button" className="btn-close" onClick={() => setShowQRModal(false)}></button>
                            </div>
                            <div className="modal-body d-flex flex-column">
                                <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (selectedAsset && selectedAsset._id) {
                                            navigate(`/asset-details/${selectedAsset._id}`);
                                        } else {
                                            console.error('Selected asset is missing or invalid.');
                                        }
                                    }}
                                >
                                    Go to Asset Details
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowQRModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals for Create, Edit, and Delete */}
            <CreateAssetModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                fetchData={fetchData}
            />

            {selectedAssetEdit && (<EditAssetModal
                show={editModalShow}
                handleClose={() => setEditModalShow(false)}
                fetchData={fetchData}
                selectedAsset={selectedAssetEdit}
            />)}

            {selectedAssetDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    id={selectedAssetDelete._id}
                    fetchData={fetchData}
                    title="Asset"
                    route="asset"
                />
            )}
        </div>
    );
};

export default AssetsLayer;