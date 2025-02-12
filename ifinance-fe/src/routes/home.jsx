import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', date: '', name: '', price: '' });
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchExpensesData();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (showForm) {
      fetchCategories();
    }
  }, [showForm]);

  function fetchExpensesData() {
    axios.post('https://i-finance-api.vercel.app/fetch_expenses_data', {}, { headers })
      .then(response => {
        const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(sortedData);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }

  function fetchCategories(e) {
    axios.get('https://i-finance-api.vercel.app/get_categories', { headers })
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(error => {
        console.error("There was an error fetching the categories!", error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prevState => ({ ...prevState, [name]: value }));
  };


  const handleAddExpense = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/add_expense', newExpense, { headers })
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
            <select 
              name="category" 
              id="add_expense_field"
              value={newExpense.category} 
              onChange={handleInputChange} 
              required
              style={{ padding: '2px'}}
            >
              <option value="" disabled>Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>       
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
