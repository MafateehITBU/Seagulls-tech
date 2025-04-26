import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from '../../axiosConfig';

const UsersChart = () => {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const MAX_DISPLAY_TECHS = 6; // Maximum number of technicians to display

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const response = await axiosInstance.get('/tech');
        setTechs(response.data.techs);
      } catch (error) {
        console.error('Error fetching techs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechs();
  }, []);

  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='card'>
        <div className='card-header border-bottom'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Technicians</h6>
            <Link
              to='#'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <iconify-icon
                icon='solar:alt-arrow-right-linear'
                className='icon'
              />
            </Link>
          </div>
        </div>
        <div className='card-body p-20'>
          <div className='d-flex flex-column gap-24'>
            {loading ? (
              // Loading skeleton - shows exactly 6 items
              Array(MAX_DISPLAY_TECHS).fill(0).map((_, index) => (
                <div key={index} className='d-flex align-items-center justify-content-between gap-3'>
                  <div className='d-flex align-items-center'>
                    <div className='w-40-px h-40-px rounded-circle bg-neutral-200 animate-pulse' />
                    <div className='flex-grow-1 ms-3'>
                      <div className='h-4 w-24 bg-neutral-200 rounded animate-pulse' />
                      <div className='h-3 w-16 bg-neutral-200 rounded animate-pulse mt-1' />
                    </div>
                  </div>
                  <div className='h-4 w-16 bg-neutral-200 rounded animate-pulse' />
                </div>
              ))
            ) : (
              // Display only first 6 technicians
              techs.slice(0, MAX_DISPLAY_TECHS).map((tech, index) => (
                <div key={index} className='d-flex align-items-center justify-content-between gap-3'>
                  <div className='d-flex align-items-center'>
                    <img
                      src={tech.photo || 'assets/images/default-avatar.png'}
                      alt={tech.name}
                      className='w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden'
                      onError={(e) => {
                        e.target.src = 'assets/images/default-avatar.png';
                      }}
                    />
                    <div className='flex-grow-1'>
                      <h6 className='text-md mb-0'>{tech.name}</h6>
                      <span className='text-sm text-secondary-light fw-normal'>
                        {tech.position || 'Technician'}
                      </span>
                    </div>
                  </div>
                  <span className='text-success-main fw-medium text-md'>
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersChart;
