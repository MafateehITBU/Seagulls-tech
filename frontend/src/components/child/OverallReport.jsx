import React, { useEffect, useState } from "react";
import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
import axiosInstance from "../../axiosConfig";

const OverallReport = () => {
  const [cleaningTickets, setCleaningTickets] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [accidentTickets, setAccidentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const [cleaningRes, maintenanceRes, accidentRes] = await Promise.all([
          axiosInstance.get('/ticket/cleaning-tickets'),
          axiosInstance.get('/ticket/maintenance-tickets'),
          axiosInstance.get('/ticket/accident-tickets')
        ]);

        setCleaningTickets(cleaningRes.data);
        setMaintenanceTickets(maintenanceRes.data);
        setAccidentTickets(accidentRes.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const totalTickets = cleaningTickets.length + maintenanceTickets.length + accidentTickets.length;
  
  const userOverviewDonutChartOptionsTwo = {
    chart: {
      type: 'donut',
      height: 270,
    },
    labels: ['Cleaning', 'Maintenance', 'Accident'],
    colors: ['#9333EA', '#22C55E', '#EAB308'],
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
              formatter: function(val) {
                return Number(val).toFixed(1) + '%';
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6B7280',
              formatter: function(w) {
                return totalTickets;
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return Number(val).toFixed(1) + '%';
        }
      }
    }
  };

  const userOverviewDonutChartSeriesTwo = totalTickets > 0 ? [
    (cleaningTickets.length / totalTickets) * 100,
    (maintenanceTickets.length / totalTickets) * 100,
    (accidentTickets.length / totalTickets) * 100
  ] : [0, 0, 0];

  return (
    <div className='col-xxl-4 col-md-6'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg'>Ticket Distribution</h6>
          </div>
        </div>
        <div className='card-body p-24'>
          <div className='mt-32'>
            <div
              id='userOverviewDonutChart'
              className='mx-auto apexcharts-tooltip-z-none'
            >
              <ReactApexChart
                options={userOverviewDonutChartOptionsTwo}
                series={userOverviewDonutChartSeriesTwo}
                type='donut'
                height={270}
              />
            </div>
          </div>
          <div className='d-flex flex-wrap gap-20 justify-content-center mt-48'>
            <div className='d-flex align-items-center gap-8'>
              <span className='w-16-px h-16-px radius-2 bg-lilac-600' />
              <span className='text-secondary-light'>Cleaning: {cleaningTickets.length}</span>
            </div>
            <div className='d-flex align-items-center gap-8'>
              <span className='w-16-px h-16-px radius-2 bg-success-600' />
              <span className='text-secondary-light'>Maintenance: {maintenanceTickets.length}</span>
            </div>
            <div className='d-flex align-items-center gap-8'>
              <span className='w-16-px h-16-px radius-2 bg-warning-600' />
              <span className='text-secondary-light'>Accident: {accidentTickets.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallReport;
