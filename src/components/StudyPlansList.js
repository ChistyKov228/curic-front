import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudyPlansList.css';

function FieldsList() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/fields')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setFields(data.data);
        } else {
          throw new Error('Data fetch failed');
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const filteredFields = fields.filter(field =>
    field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.fieldCode.includes(searchTerm)
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFieldClick = (fieldId) => {
    navigate(`/curricula/${fieldId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fields-list">
      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </form>
      <table className="fields-table">
        <thead>
          <tr>
            <th>Код напрваления</th>
            <th>Наименование напрваления</th>
            <th>Квалификация </th>
            <th>Длительность</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredFields.map(field => (
            <tr key={field.fieldId} onClick={() => handleFieldClick(field.fieldId)} style={{ cursor: 'pointer' }}>
              <td>{field.fieldCode}</td>
              <td>{field.fieldName}</td>
              <td>{field.degreeLevel}</td>
              <td>{field.studyLength} года</td>
              
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
}

export default FieldsList;
