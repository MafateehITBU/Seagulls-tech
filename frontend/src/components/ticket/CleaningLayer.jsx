import React, { useEffect } from 'react'
import $ from 'jquery';
import 'datatables.net-dt/js/dataTables.dataTables';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Link } from 'react-router-dom';


const CleaningLayer = () => {
    useEffect(() => {
        const table = $('#dataTable').DataTable({
            pageLength: 10,
        });
        return () => {
            table.destroy(true);
        };
    }, []);


    return (
        <div className="card basic-data-table">
            <div className="card-header">
                <h5 className='card-title mb-0'>Cleaning Tickets</h5>
            </div>

            <div className="card-body">
                <table
                    className='table bordered-table mb-0'
                    id='dataTable'
                    data-page-length={10}
                >
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Customer Name</th>
                            <th>Address</th>
                            <th>Phone Number</th>
                            <th>Service Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td><Link to="/ticket-details">#12345</Link></td>
                            <td>John Doe</td>
                            <td>123 Main St, City, Country</td>
                            <td>(123) 456-7890</td>
                            <td>Cleaning</td>
                            <td><span className="badge bg-success">Completed</span></td>
                            <td><Link to="/ticket-details"><Icon icon="akar-icons:eye" /></Link></td>
                        </tr>

                        {/* Add more rows as needed */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CleaningLayer