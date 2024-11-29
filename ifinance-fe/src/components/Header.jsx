import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container} from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  let admin = false;
  let decodedToken = 0;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    }
    catch (error) {
      console.error("Some error!")
    }
    if (decodedToken.admin){
      admin = decodedToken.admin
    } 
  }
  
  return (
    <Navbar bg="dark" variant='dark' expand='lg'>
      <Container>
        <Navbar.Brand href="/">iFinance</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            {token && (
              <Nav.Link href="/Charts">Chartview</Nav.Link>
            )}
            {admin && (
                <NavDropdown title="Admin tools" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/AddCategory">Add Category</NavDropdown.Item>
                  <NavDropdown.Item href="/Deleteuser">Delete User</NavDropdown.Item>
                </NavDropdown>
            )}
          </Nav>
          <Nav className="ms-auto">
            {!token ? (
              <>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/register">Register</Nav.Link>
              </>
            ) : (
              <Nav.Link href="/logout">Logout</Nav.Link> 
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
  
};

export default Header;