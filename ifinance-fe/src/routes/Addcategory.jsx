import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Button from 'react-bootstrap/Button';
import axios from "axios";

const addCategory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const [admin, setAdmin] = useState(false);
  const [data, setData] = useState([]);
  const [newCategory, setNewCaterory] = useState({ category: '' });
  const [statusCode, setStatusCode] = useState(null);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token
  };
  
  const decodedToken = jwtDecode(token);

  useEffect(() => {
    if (token) {
      try {
        setAdmin(decodedToken.admin === 1);
      } catch (error) {
        console.error("Invalid token");
        setAdmin(false);
      }
    } else {
      setAdmin(false);
    }
  }, [token]);

  useEffect(() => {
    if (!decodedToken.admin || !token) {
      navigate('/login');
    }
  }, [admin, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCaterory(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/add_category', newCategory, { headers })
      .then(response => {
        setData(prevData => [...prevData, response.data]);
        setNewCaterory({ category: ''}); // Clear form fields
        setStatusCode(200);
      })
      .catch(error => {
        console.error("There was an error adding category!", error);
        setStatusCode(error.response.status);
      })
  };

  return (
    <div id="add_category_form">
      <h4>Add category</h4>
      <form onSubmit={handleAddCategory}>
          <input 
            type="text" 
            name="category" 
            placeholder="Type a category"
            style={{ borderRadius: '5px' }}
            value={newCategory.category} 
            onChange={handleInputChange} 
            required 
          />
           <Button variant="secondary" type="submit" id="add_expense_field">Submit</Button>
        </form>
        { statusCode === 200 ? (
          <p style={{ color: "green" }}>Category added!</p>
        ) : (
          statusCode && <p style={{ color: "red" }}>Error, try again (Status Code: {statusCode})</p>
        )}
      </div>
  )
}

export default addCategory;