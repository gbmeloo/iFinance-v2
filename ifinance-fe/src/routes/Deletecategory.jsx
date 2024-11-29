import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Form, Button } from 'react-bootstrap';
import axios from "axios";

const Deletecategory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const [admin, setAdmin] = useState(false);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
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
    if (decodedToken.admin == false || !token) {
      navigate('/login');
    } else {
      fetchCategories();
    }
  }, [admin, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCaterory(prevState => ({ ...prevState, [name]: value }));
  };

  const fetchCategories = () => {
    axios.get('http://127.0.0.1:8000/get_categories', { headers })
      .then(response => {
        setCategories(response.data.categories);
      })
      .catch(error => {
        console.error("There was an error fetching the categories!", error);
      });
  };


  const handleDeleteCategory = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/delete_category', newCategory, { headers })
      .then(response => {
        setData(prevData => [...prevData, response.data]);
        setNewCaterory({ category: ''}); // Clear form fields
        setStatusCode(200);
        fetchCategories();
      })
      .catch(error => {
        console.error("There was an error adding category!", error);
        setStatusCode(error.response.status);
      })
  };

    return (
      <div id="delete_category_form">
        <h4>Delete category</h4>
        <Form onSubmit={handleDeleteCategory} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <select 
            name="category" 
            id="delete_category_field"
            value={data.category} 
            onChange={handleInputChange} 
            required
            style={{ padding: '2px', marginRight: '10px' }}
          >
            <option value="" disabled selected>Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category} id="delete_category_option">
                {category}
              </option>
            ))}
            </select>  
            <Button variant="secondary" type="submit" id="add_expense_field">Submit</Button>
          </Form>
          { statusCode === 200 ? (
            <p style={{ color: "green" }}>Category deleted!</p>
          ) : (
            statusCode && <p style={{ color: "red" }}>Error, try again (Status Code: {statusCode})</p>
          )}
        </div>
    )
  }

  export default Deletecategory;