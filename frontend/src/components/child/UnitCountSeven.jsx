import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const UnitCountSeven = () => {
    const [techCount, setTechCount] = useState(0);
    const [cleaningTickets, setCleaningTickets] = useState([]);
    const [maintenanceTickets, setMaintenanceTickets] = useState([]);
    const [accidentTickets, setAccidentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [closedTicketsCount, setClosedTicketsCount] = useState(0);
    const [vendorCount, setVendorCount] = useState(0);
    const [sparePartsCount, setSparePartsCount] = useState(0);
    const [assetCount, setAssetCount] = useState(0);

    useEffect(() => {
        const fetchTechCount = async () => {
            try {
                const response = await axiosInstance.get('/tech');
                setTechCount(response.data.techs.length);
            } catch (error) {
                console.error('Error fetching tech count:', error);
            }
        };

        const fetchVendorCount = async () => {
            try {
                const response = await axiosInstance.get('/vendor');
                setVendorCount(response.data.vendors.length);
            } catch (error) {
                console.error('Error fetching vendor count:', error);
            }
        };

        const fetchSparePartsCount = async () => {
            try {
                const response = await axiosInstance.get('/sparepart');
                setSparePartsCount(response.data.length);
            } catch (error) {
                console.error('Error fetching spare parts count:', error);
            }
        };

        const fetchAssetCount = async () => {
            try {
                const response = await axiosInstance.get('/asset');
                setAssetCount(response.data.length);
            } catch (error) {
                console.error('Error fetching asset count:', error);
            }
        };

        const fetchTickets = async () => {
            try {
                // Fetch cleaning tickets
                try {
                    const cleaningResponse = await axiosInstance.get('/ticket/cleaning-tickets');
                    console.log('Cleaning tickets response:', cleaningResponse.data);
                    if (Array.isArray(cleaningResponse.data)) {
                        setCleaningTickets(cleaningResponse.data);
                    } else {
                        setCleaningTickets([]);
                    }
                } catch (cleaningError) {
                    console.error('Error fetching cleaning tickets:', cleaningError);
                    setCleaningTickets([]);
                }

                // Fetch maintenance tickets
                try {
                    const maintenanceResponse = await axiosInstance.get('/ticket/maintenance-tickets');
                    console.log('Maintenance tickets response:', maintenanceResponse.data);
                    if (Array.isArray(maintenanceResponse.data)) {
                        setMaintenanceTickets(maintenanceResponse.data);
                    } else {
                        setMaintenanceTickets([]);
                    }
                } catch (maintenanceError) {
                    console.error('Error fetching maintenance tickets:', maintenanceError);
                    setMaintenanceTickets([]);
                }

                // Fetch accident tickets
                try {
                    const accidentResponse = await axiosInstance.get('/ticket/accident-tickets');
                    console.log('Accident tickets response:', accidentResponse.data);
                    if (Array.isArray(accidentResponse.data)) {
                        setAccidentTickets(accidentResponse.data);
                    } else {
                        setAccidentTickets([]);
                    }
                } catch (accidentError) {
                    console.error('Error fetching accident tickets:', accidentError);
                    setAccidentTickets([]);
                }
            } catch (error) {
                console.error('General error in fetchTickets:', error);
                setError('Failed to load tickets');
            } finally {
                setLoading(false);
            }
        };

        const fetchClosedTickets = async () => {
            try {
                setLoading(true);
                const [cleaningRes, maintenanceRes, accidentRes] = await Promise.all([
                    axiosInstance.get('/ticket/closed-cleaning'),
                    axiosInstance.get('/ticket/closed-maintenance'),
                    axiosInstance.get('/ticket/closed-accident')
                ]);

                const totalClosed = cleaningRes.data.length + maintenanceRes.data.length + accidentRes.data.length;
                setClosedTicketsCount(totalClosed);
            } catch (error) {
                console.error('Error fetching closed tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTechCount();
        fetchVendorCount();
        fetchSparePartsCount();
        fetchAssetCount();
        fetchTickets();
        fetchClosedTickets();
    }, []);

    return (
        <>
            <div className='col-12'>
                <div className='card radius-12'>
                    <div className='card-body p-16'>
                        <div className='row gy-4'>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Technicians
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    techCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                                            <i className='ri-user-settings-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Technicians{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Cleaning Tickets
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : error ? (
                                                    <span className="text-danger-main">Error</span>
                                                ) : (
                                                    cleaningTickets.length
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600'>
                                            <i className='ri-brush-fill' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Opened Cleaning Tickets{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Maintenance Tickets
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : error ? (
                                                    <span className="text-danger-main">Error</span>
                                                ) : (
                                                    maintenanceTickets.length
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600'>
                                            <i className='ri-tools-fill' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Opened Maintenance Tickets{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-4 left-line line-bg-warning position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Accident Tickets
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : error ? (
                                                    <span className="text-danger-main">Error</span>
                                                ) : (
                                                    accidentTickets.length
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-warning-focus text-warning-600'>
                                            <i className='ri-error-warning-fill' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Opened Accident Tickets{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Closed Tickets
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    closedTicketsCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                                            <i className='ri-checkbox-circle-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Closed Tickets{" "}
                                    </p>
                                </div>
                            </div>

                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Assets
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    assetCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600'>
                                            <i className='ri-building-2-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Assets{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Vendors
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    vendorCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600'>
                                            <i className='ri-store-2-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Vendors{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-3 col-xl-4 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-4 left-line line-bg-warning position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Spare Parts
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    sparePartsCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-warning-200 text-warning-600'>
                                            <i className='ri-tools-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Spare Parts{" "}
                                    </p>
                                </div>
                            </div>
                         
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnitCountSeven;
