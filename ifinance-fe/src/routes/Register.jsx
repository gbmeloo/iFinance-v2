import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Get the history object to navigate

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect to home page if token exists
    }
  }, []); 

  const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent the default form submission  

      if (password !== confirmation) {
        // Display an error message or handle the condition as needed
        console.log('Passwords do not match');
        return;
      }

      try {
        // Send POST request to API
        const response = await axios.post('http://127.0.0.1:8000/register', {
          name,
          username,
          password,
          confirmation
        });
  
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);

        console.log("Works!!")
  
        // Redirect user to home page
        navigate('/login');
      } catch (error) {
          console.error(error); // Log any errors
          // Handle error
          console.log("Some error occurred")
      }
  };

  const handleNameChange = (event) => {
    setName(event.target.value); // Update name state
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value); // Update username state
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value); // Update password state
  };

  const handleconfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value); // Update password state
  };

  return (
    <div id="loginContainer">
      <Form id="loginForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicname">
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange} // Call handleNameChange on change
            />
          </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicusername">
          <Form.Label>Username</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter username"
            value={username}
            onChange={handleUsernameChange} // Call handleUsernameChange on change
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange} // Call handlePasswordChange on change
            />
            <Form.Text>Your password must contain at least 8 character, numbers, and special characters.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmation}
              onChange={handleconfirmPasswordChange} // Call handlePasswordChange on change
            />
            {confirmation !== password ? (
            <Form.Text style={{color: "#fb3232"}}>Passwords must match</Form.Text>
            ): null}
          </Form.Group>
        <Button variant="primary" type="submit" disabled={confirmation !== password}>
          Submit
        </Button>
    </Form>
  </div>
  )
};

export default Register;