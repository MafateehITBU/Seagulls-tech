import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosConfig';

const ClosedTicketsCount = () => {
    const [loading, setLoading] = useState(true);
    const [cleaningCount, setCleaningCount] = useState(0);
    const [maintenanceCount, setMaintenanceCount] = useState(0);
    const [accidentCount, setAccidentCount] = useState(0);

    useEffect(() => {
        const fetchClosedTickets = async () => {
            try {
                setLoading(true);
                const [cleaningRes, maintenanceRes, accidentRes] = await Promise.all([
                    axiosInstance.get('/ticket/closed-cleaning'),
                    axiosInstance.get('/ticket/closed-maintenance'),
                    axiosInstance.get('/ticket/closed-accident')
                ]);

                setCleaningCount(cleaningRes.data.length);
                setMaintenanceCount(maintenanceRes.data.length);
                setAccidentCount(accidentRes.data.length);
            } catch (error) {
                console.error('Error fetching closed tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClosedTickets();
    }, []);

    return (
        <div className="row">
            {/* Cleaning Tickets */}
            <div className="col-md-4 mb-4">
                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                        <div>
                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                Cleaning Tickets
                            </span>
                            <h6 className='fw-semibold mb-1'>
                                {loading ? (
                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                ) : (
                                    cleaningCount
                                )}
                            </h6>
                        </div>
                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                            <i className='ri-brush-line' />
                        </span>
                    </div>
                    <p className='text-sm mb-0'>
                        Total Closed Cleaning Tickets
                    </p>
                </div>
            </div>

            {/* Maintenance Tickets */}
            <div className="col-md-4 mb-4">
                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                        <div>
                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                Maintenance Tickets
                            </span>
                            <h6 className='fw-semibold mb-1'>
                                {loading ? (
                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                ) : (
                                    maintenanceCount
                                )}
                            </h6>
                        </div>
                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                            <i className='ri-tools-line' />
                        </span>
                    </div>
                    <p className='text-sm mb-0'>
                        Total Closed Maintenance Tickets
                    </p>
                </div>
            </div>

            {/* Accident Tickets */}
            <div className="col-md-4 mb-4">
                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                        <div>
                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                Accident Tickets
                            </span>
                            <h6 className='fw-semibold mb-1'>
                                {loading ? (
                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                ) : (
                                    accidentCount
                                )}
                            </h6>
                        </div>
                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                            <i className='ri-car-crash-line' />
                        </span>
                    </div>
                    <p className='text-sm mb-0'>
                        Total Closed Accident Tickets
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClosedTicketsCount; 