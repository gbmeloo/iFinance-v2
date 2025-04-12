import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', date: '', name: '', price: '' });
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_URL;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token,
    'Access-Control-Allow-Origin': '*'
  };

  useEffect(() => {
    if (!token) {
      navigate('/Login');
    } else {
      fetchExpensesData();
    }
  }, [token, navigate]);

  const fetchExpensesData = async () => {
    await axios.post(`${API}/fetch_expenses_data`, {}, { headers })
      .then(response => {
        const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(sortedData);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prevState => ({ ...prevState, [name]: value }));
  };


  const handleAddExpense = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/add_expense`, newExpense, { headers })
      .then(response => {
        setData(prevData => [...prevData, response.data]);
        setShowForm(false);
        fetchExpensesData();
        setNewExpense({ name: '', category: '', date: '', price: '' }); // Clear form fields
      })
      .catch(error => {
        console.error("There was an error adding the expense!", error);
      });
  };

  return (
    <div id="expensesTable">
      {showForm && (
        <div id="add_expense_form">
          <h4>Add New Expense</h4>
          <form onSubmit={handleAddExpense}>
            <input 
              type="text" 
              name="name" 
              placeholder="Name"
              style={{ borderRadius: '5px' }}
              value={newExpense.name} 
              onChange={handleInputChange} 
              required 
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              style={{ borderRadius: '5px' }}
              id="add_expense_field"
              value={newExpense.category} 
              onChange={handleInputChange} 
              required
            />     
            <input 
              type="date" 
              name="date" 
              placeholder="Date"
              style={{ padding: '1px', borderRadius: '5px', marginLeft: '1%'}}
              value={newExpense.date} 
              onChange={handleInputChange} 
              required 
            />
            <input 
              type="number" 
              name="price" 
              placeholder="Price"
              id="add_expense_field"
              value={newExpense.price} 
              onChange={handleInputChange} 
              required 
            />
            <Button variant="secondary" type="submit" id="add_expense_field">Add Expense</Button>
          </form>
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <th colSpan="4" id="title_row">
              Expenses
              <Button onClick={() => setShowForm(true)} id="add_expense_button">+</Button>
            </th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="4">Start adding your expenses by clicking on the "+"</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.price}</td>
              </tr>
            ))
          )}       
        </tbody>
      </Table>
    </div>
  );
};

export default Home;
