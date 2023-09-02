import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./styles.css";

function App1() {
  const [file, setFile] = useState(null);
  const token = localStorage.getItem('loggedInUserToken');
  const [fileList, setFileList] = useState([]);
  const [authToken, setAuthToken] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNo: '',
    permanentAddress: '',
    school: {
      schoolName: '',
      board: '',
      percentage: '',
      year: '',
      location: '',
    },
    college: {
      collegeName: '',
      department: '',
      percentage: '',
      year: '',
      location: '',
    },
  });
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  useEffect(() => {
    fetchFileList();
  }, [authToken]);

  const handleLogin = (token) => {
    setAuthToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:3001/personal', formData);
      console.log(response.data.message);
    } catch (error) {
      if (error.response) {
        console.error('Request was made but got an error response:', error.response.data);
      } else if (error.request) {
        console.error('Request was made but no response was received:', error.request);
      } else {
        console.error('An error occurred while setting up the request:', error.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Split the name into its parts
    const nameParts = name.split('.');
    const fieldName = nameParts[0]; // e.g., "school", "college"
    const property = nameParts[1]; // e.g., "schoolName", "collegeName"
  
    if (fieldName === "school") {
      setFormData((prevData) => ({
        ...prevData,
        school: {
          ...prevData.school,
          [property]: value,
        },
      }));
    } else if (fieldName === "college") {
      setFormData((prevData) => ({
        ...prevData,
        college: {
          ...prevData.college,
          [property]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  const fetchFileList = async () => {
    try {
      const response = await axios.get('http://localhost:3001/files', {
        headers: {
          Authorization: `Bearer ${authToken}` // Include the auth token in the request headers
        }
      });
      setFileList(response.data);
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:3001/upload', formData, config,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('File uploaded successfully:', response.data);
        alert('File uploaded successfully!');
        fetchFileList(); // Refresh the file list
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDelete = async (filename) => {
    try {
      const response = await axios.delete(`http://localhost:3001/delete/${filename}`);
  
      if (response.status === 200) {
        console.log('File deleted successfully');
        fetchFileList(); // Refresh the file list
      } else {
        console.error('File deletion failed');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserToken');
    setIsLoggedIn(false);
    navigate('/login'); // Adjust the path based on your login route
  };

  const handleProfileRedirect = () => {
    // Extract necessary data from formData, fileList, etc.
    const {
      fullName,
      email,
      mobileNo,
      permanentAddress,
      school,
      college,
    } = formData;

  const profileData = {
    firstName: fullName,
    lastName: '', // You can split fullName into first and last names if needed
    email,
    mobileNo,
    address: permanentAddress,
    schoolData: school,
    collegeData: college,
    fileList,
  };

  localStorage.setItem('profileData', JSON.stringify(profileData));

  // Redirect to the profile page
  navigate('/profile'); // Use the navigate hook to redirect
};


  return (
    <>
    <div >
    <form onSubmit={handleSubmit}>
      {currentStep === 1 && (
        <div className="person-details">
        <h2>Person Details:</h2>
        <div className="input-group">
          <div className="input-field">
            <label>Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="input-field">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-field">
            <label>Mobile No:</label>
            <input
              type="text"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleInputChange}
              placeholder="Mobile No"
            />
          </div>
          <div className="input-field">
            <label>Permanent Address:</label>
            <input
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleInputChange}
              placeholder="Address"
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
      )}

      {currentStep === 2 && (
        <div className="person-details">
          <h2>Education Details:</h2>
          <div className="input-group">
            <div className="input-field">
              <label>School Name:</label>
              <input type="text" name="school.schoolName" value={formData.school.schoolName} onChange={handleInputChange} placeholder="School Name" required/>
            </div>
            <div className="input-field">
              <label>Board:</label>
              <input type="text" name="school.board" value={formData.school.board} onChange={handleInputChange} placeholder="Board" required/>
            </div>
            <div className="input-field">
              <label>Percentage:</label>
              <input type="number" name="school.percentage" value={formData.school.percentage} onChange={handleInputChange} placeholder="Percentage" required/>
            </div>
            <div className="input-field">
              <label>Passed Out Year:</label>
              <input type="number" name="school.year" value={formData.school.year} onChange={handleInputChange} placeholder="Year" required />
            </div>
            <div className="input-field">
              <label>Location:</label>
              <input type="text" name="school.location" value={formData.school.location} onChange={handleInputChange} placeholder="Location" required />
            </div>
          </div>
          
          <button className="btn btn-secondary" onClick={handleBack}>Back</button>
          <button className="btn btn-primary" onClick={handleNext}>Next</button>
        </div> 
      )}

      {currentStep === 3 && (
        <>
        <div className="person-details">
          <h2>College Details</h2>
          <div className="input-group">
            <div className="input-field">
              <label>College Name:</label>
              <input type="text" name="college.collegeName" value={formData.college.collegeName} onChange={handleInputChange} placeholder="College Name" required/>
            </div>
            <div className="input-field">
              <label>Department:</label>
              <input type="text" name="college.department" value={formData.college.department} onChange={handleInputChange} placeholder="Department" required />
            </div>
            <div className="input-field">
              <label>Percentage:</label>
              <input type="number" name="college.percentage" value={formData.college.percentage} onChange={handleInputChange} placeholder="Percentage" required/>
            </div>
            <div className="input-field">
              <label>Year:</label>
              <input type="number" name="college.year" value={formData.college.year} onChange={handleInputChange} placeholder="Year" required/>
            </div>
            <div className="input-field">
              <label>Location:</label>
              <input type="text" name="college.location" value={formData.college.location} onChange={handleInputChange} placeholder="Location" required/>
            </div>
          </div>
            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
            <button className="btn btn-primary" onClick={handleNext}>Next</button>
          <br></br> <br></br>
        </div>
        </>
      )}    
          
      {currentStep === 4 && (
        <div className="file-section">
          <>
          <input type="file" className="file-input" onChange={handleFileChange} />
          <button className="upload-btn" onClick={handleUpload}>Upload File</button>
          <div className="uploaded-files">
            <h2>Uploaded Resume:</h2>
            <ul>
              {fileList.map((file, index) => (
                <li key={index}>
                  {file.filename}{' '}
                  <a href={`http://localhost:3001/download/${file.filename}`} className="download-link" download>
                    Download
                  </a>{' '}
                  <button className="delete-btn" onClick={() => handleDelete(file.filename)}>Delete</button>
                </li>
                )
              )}
            </ul>
          </div>
          <div> 
            <button className="view-profile-btn" onClick={handleProfileRedirect}>View Profile</button>
            <button className="back-btn" onClick={handleBack}>Back</button>
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
          
          </>
          </div>
          )}
           </form>
        </div>
    </>
          )};
export default App1;
