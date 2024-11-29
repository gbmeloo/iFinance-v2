import { useNavigate } from 'react-router-dom';

function Logout() {

    const navigate = useNavigate(); // Get the history object to navigate
    
    try {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Redirect user to login page
        window.location.href = '/login';

        navigate("/login")
    }
    catch {
        console.error(error); // Log any errors
        // Handle error
        console.log("Some error occurred")
    };


  
    return null;
};

export default Logout;