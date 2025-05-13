import React, { useState, useEffect } from "react";
import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";

const PurchaseAndSales = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("accident");
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Time Spent',
      data: [0]
    }],
    categories: ['No Data']
  });

  // Function to convert minutes to hours with 2 decimal places
  const minutesToHours = (minutes) => {
    return (minutes / 60).toFixed(2);
  };

  // Function to format hours for display
  const formatHours = (hours) => {
    return `${hours} hrs`;
  };

  const fetchTicketData = async (category) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      console.log('Token:', token);

      const response = await axiosInstance.get(`/ticket/closed-${category}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);

      // Process the data for the chart
      const tickets = response.data || [];
      
      if (tickets.length === 0) {
        setChartData({
          series: [{
            name: 'Time Spent',
            data: [0]
          }],
          categories: ['No Data']
        });
        return;
      }

      // Use array indices as ticket positions and convert minutes to hours
      const ticketPositions = tickets.map((ticket, index) => {
        const assetName = ticket.ticketId?.assetId?.assetName || `Ticket ${index + 1}`;
        return assetName;
      });

      const timeSpent = tickets.map(ticket => {
        const timer = ticket.ticketId?.timer || 0;
        return parseFloat(minutesToHours(timer));
      });

      console.log('Processed Data:', { ticketPositions, timeSpent });

      setChartData({
        series: [{
          name: 'Time Spent',
          data: timeSpent
        }],
        categories: ticketPositions
      });
    } catch (error) {
      console.error('Error fetching ticket data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      // Set default data on error
      setChartData({
        series: [{
          name: 'Time Spent',
          data: [0]
        }],
        categories: ['Error Loading Data']
      });
    }
  };

  useEffect(() => {
    console.log('Selected Category:', selectedCategory);
    fetchTicketData(selectedCategory);
  }, [selectedCategory]);

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return formatHours(val);
      },
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: 'Asset Name'
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Time Spent (Hours)'
      },
      min: 0,
      labels: {
        formatter: function (val) {
          return formatHours(val);
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatHours(val);
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.8
        }
      }
    }
  };

  console.log('Current Chart Data:', chartData);

  return (
    <div className='col-xxl-8 col-md-6'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Ticket Time Analysis</h6>
            <select 
              className='form-select form-select-sm w-auto bg-base text-secondary-light'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="accident">Accident</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div className='card-body p-24 d-flex align-items-center justify-content-center'>
          <div id='ticketTimeChart' style={{ width: '100%', maxWidth: '800px' }}>
            <ReactApexChart
              options={chartOptions}
              series={chartData.series}
              type='bar'
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAndSales;
