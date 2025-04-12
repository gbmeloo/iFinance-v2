import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Get the history object to navigate
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect to home page if token exists
    }
  }, []); 

  const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent the default form submission  

      try {
        // Send POST request to API
        const response = await axios.post(`${API}/login`, {
          username,
          password
        });
  
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);

        if (response.status === 600) {
          setError(600); // Set error state if status is 600
        } else if (!response.ok) {
          setError('Something went wrong');
        }
  
        // Redirect user to home page
        navigate('/');
      } catch (error) {
          setError(error);
          console.error(error); // Log any errors
      }
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value); // Update username state
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value); // Update password state
  };

  return (
    <div id="loginContainer">
      <Form id="loginForm" onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formBasicusername">
        <Form.Label>Username</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Enter username"
          value={username}
          onChange={handleUsernameChange} // Call handleUsernameChange on change
        />
        <Form.Text className="text-muted">
          We'll never share your username with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange} // Call handlePasswordChange on change
          />
        </Form.Group>
        {error === 600 ? (
                <Form.Text style={{color: "#fb3232"}}>Invalid username or password</Form.Text>
            ) : error ? (
                <Form.Text style={{color: "#fb3232"}}>{error}</Form.Text>
            ) : null}
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  </div>
  )
}

export default Login;