import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProfilePage() {
  const [personalInfo, setPersonalInfo] = useState({});
  const [userFiles, setUserFiles] = useState([]);
  const token = localStorage.getItem('loggedInUserToken');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const deleteFile = async (filename) => {
    try {
      const response = await axios.delete(`http://localhost:3001/delete/${filename}`, config);

      if (response.status === 200) {
        // File deleted successfully, update userFiles
        setUserFiles((prevUserFiles) =>
          prevUserFiles.filter((file) => file.filename !== filename)
        );
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  useEffect(() => {
    // Fetch current user's personal information
    async function fetchCurrentUserPersonalInfo() {
      try {
        const personalResponse = await axios.get('http://localhost:3001/currentUser', config);
        setPersonalInfo(personalResponse.data);

        const filesResponse = await axios.get('http://localhost:3001/userFile', config);
        setUserFiles(filesResponse.data);
      } catch (error) {
        console.error('Error fetching personal information:', error);
      }
    } 

    fetchCurrentUserPersonalInfo();
  }, [config]);

  return (
    <>
    <div>
  <h2>User Profile</h2>
  <p>Full Name: {personalInfo.fullName}</p>
  <p>Email: {personalInfo.email}</p>
  <p>Mobile No: {personalInfo.mobileNo}</p>
  <p>Permanent Address: {personalInfo.permanentAddress}</p>

  <h3>School Information</h3>
  <p>School Name: {personalInfo.school?.schoolName}</p>
  <p>Board: {personalInfo.school?.board}</p>
  <p>Percentage: {personalInfo.school?.percentage}</p>
  <p>Year: {personalInfo.school?.year}</p>
  <p>Location: {personalInfo.school?.location}</p>

  <h3>College Information</h3>
  <p>College Name: {personalInfo.college?.collegeName}</p>
  <p>Department: {personalInfo.college?.department}</p>
  <p>Percentage: {personalInfo.college?.percentage}</p>
  <p>Year: {personalInfo.college?.year}</p>
  <p>Location: {personalInfo.college?.location}</p>
</div>

<div>
      <h2>User Files</h2>
      {userFiles.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <ul>
          {userFiles.map((file, index) => (
            <li key={index}>
              {file.filename}{' '}
              <a href={`http://localhost:3001/download/${file.filename}`} className="download-link" download>
                Download
              </a>{' '}
              <button className="delete-btn" onClick={() => deleteFile(file.filename)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}

export default ProfilePage;