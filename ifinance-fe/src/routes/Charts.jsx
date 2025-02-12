import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types';
import axios from 'axios';
import { BarChart } from '@mui/x-charts/BarChart';

const ChartBuild = ({ x, y }) => {
    return (
      <BarChart
        borderRadius={10}
        xAxis={[{ 
          data: x,
          label: 'Months',
          scaleType: 'band'
        }]}
        yAxis={[{
          label: 'Expense sum'
        }]}
        series={[{ 
            data: y,
            label: 'Expense by month'
        }]}
        width={700}
        height={300}
      />
    );
  };

  ChartBuild.propTypes = {
    x: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    y: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  };

const Charts = () => {
    const [years, setYears] = useState([]);
    const [chartData, setChartData] = useState({ x: [], y: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const token = localStorage.getItem('token')

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    };

    useEffect(() => {
      axios.get('https://i-finance-api.vercel.app/chartview', { headers })
        .then(response => {
          setYears(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching years:', error);
          setError('Error fetching available years.');
          setLoading(false);
        });
    }, []);

    const handleYearChange = (event) => {
      const year = event.target.value;
      setSelectedYear(year);
      fetchChartData(year);
    };

    const fetchChartData = (year) => {
      setLoading(true);
      axios.post('http://127.0.0.1:8000/fetch_data_chart', { year }, { headers })
        .then(response => {
          const data = response.data;
          const xValues = data.map(item => item.month); // Extracting month values for x-axis
          const yValues = data.map(item => parseFloat(item.total_value)); // Extracting total_value and converting to float for y-axis
          setChartData({ x: xValues, y: yValues });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching chart data:', error);
          setError('Error fetching chart data.');
          setLoading(false);
        });
    }
 
    return (
    <div className="chart-container">
      <h1>Charts</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <select value={selectedYear} onChange={handleYearChange}>
        <option value="" disabled>Select a year</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      {selectedYear && <ChartBuild x={chartData.x} y={chartData.y} />}
    </div>
 
  );
};

export default Charts;