import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { Icon } from "@iconify/react";

const TopTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await axiosInstance.get("/ticket/tech");
        // Sort technicians by closedTicketsCount in descending order and take top 5
        const sortedTechnicians = response.data
          .sort((a, b) => b.closedTicketsCount - a.closedTicketsCount)
          .slice(0, 7);
        setTechnicians(sortedTechnicians);
      } catch (error) {
        console.error("Error fetching technicians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  return (
    <div className='col-xxl-8 col-md-6'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Top Technicians</h6>
            <Link
              to='/technicians'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
        </div>
        <div className='card-body p-24'>
          <div className='table-responsive scroll-sm'>
            <table className='table bordered-table mb-0'>
              <thead>
                <tr>
                  <th scope='col' className="text-center">Rank</th>
                  <th scope='col' className="text-center">Technician</th>
                  <th scope='col' className="text-center">Closed Tickets</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center">
                      <Icon icon="eos-icons:loading" className="icon" />
                    </td>
                  </tr>
                ) : technicians.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center">No technicians found</td>
                  </tr>
                ) : (
                  technicians.map((tech, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <span className='text-secondary-light'>{index + 1}</span>
                      </td>
                      <td className="text-center">
                        <span className='text-secondary-light'>
                          {tech.techName}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className='text-secondary-light'>{tech.closedTicketsCount}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTechnicians;
