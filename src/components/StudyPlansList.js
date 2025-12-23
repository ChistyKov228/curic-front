import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudyPlansList.css';

function FieldsList() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [formData, setFormData] = useState({
    fieldCode: '',
    fieldName: '',
    degreeLevel: '',
    profileName: '',
    studyLength: ''
  });
  const [errors, setErrors] = useState({
    fieldCode: false,
    fieldName: false,
    degreeLevel: false,
    profileName: false,
    studyLength: false
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

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
    field.fieldName && field.fieldName.trim() !== '' &&
    (field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.fieldCode.includes(searchTerm))
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFieldClick = (fieldId) => {
    navigate(`/curricula/${fieldId}`);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      fieldCode: !formData.fieldCode.trim(),
      fieldName: !formData.fieldName.trim(),
      degreeLevel: !formData.degreeLevel.trim(),
      profileName: !formData.profileName.trim(),
      studyLength: !formData.studyLength.trim()
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    const studyLength = parseInt(formData.studyLength);
    if (isNaN(studyLength)) {
      alert('Длительность должна быть числом');
      return;
    }

    const token = localStorage.getItem('token');
    const newField = { ...formData, studyLength };

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `http://localhost:8080/api/admin/fields/${editingFieldId}` : 'http://localhost:8080/api/admin/fields';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newField)
      });

      if (response.ok) {
        const data = await response.json();
        if (isEditing) {
          setFields(fields.map(f => f.fieldId === editingFieldId ? data.data : f));
          alert('Направление обновлено');
        } else {
          setFields([...fields, data.data]);
          alert('Направление создано');
        }
        setShowCreateModal(false);
        setFormData({
          fieldCode: '',
          fieldName: '',
          degreeLevel: '',
          profileName: '',
          studyLength: ''
        });
        setErrors({
          fieldCode: false,
          fieldName: false,
          degreeLevel: false,
          profileName: false,
          studyLength: false
        });
        setIsEditing(false);
        setEditingFieldId(null);
      } else {
        alert(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} направления`);
      }
    } catch (error) {
      console.error(`${isEditing ? 'Update' : 'Create'} failed:`, error);
      alert(`Ошибка при ${isEditing ? 'обновлении' : 'создании'}`);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setEditingFieldId(null);
    setFormData({
      fieldCode: '',
      fieldName: '',
      degreeLevel: '',
      profileName: '',
      studyLength: ''
    });
    setErrors({
      fieldCode: false,
      fieldName: false,
      degreeLevel: false,
      profileName: false,
      studyLength: false
    });
  };

  const handleEdit = (fieldId) => {
    const field = fields.find(f => f.fieldId === fieldId);
    if (field) {
      setFormData({
        fieldCode: field.fieldCode,
        fieldName: field.fieldName,
        degreeLevel: field.degreeLevel,
        profileName: field.profileName,
        studyLength: field.studyLength.toString()
      });
      setIsEditing(true);
      setEditingFieldId(fieldId);
      setShowCreateModal(true);
    }
  };

  const handleDelete = async (fieldId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это направление?')) return;

    const token = localStorage.getItem('token');

    try {
      const curriculaResponse = await fetch(`http://localhost:8080/api/curricula/${fieldId}`);
      if (curriculaResponse.ok) {
        const curriculaData = await curriculaResponse.json();
        if (curriculaData.status === 'success') {
          const curricula = curriculaData.data;
          const planId = curricula.studyPlanId;
          const blocks = curricula.disciplines.map(discipline => ({
            disciplineId: discipline.disciplineId,
            term: discipline.term
          }));
          const contentResponse = await fetch(`http://localhost:8080/api/admin/fields/${fieldId}/study-plans/${planId}/content`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ blocks })
          });
          if (!contentResponse.ok) {
            alert('Ошибка при удалении контента учебного плана');
            return;
          }
          const planResponse = await fetch(`http://localhost:8080/api/admin/fields/${fieldId}/study-plans/${planId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!planResponse.ok) {
            alert('Ошибка при удалении учебного плана');
            return;
          }
        }
      }
      const fieldResponse = await fetch(`http://localhost:8080/api/admin/fields/${fieldId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (fieldResponse.ok) {
        setFields(fields.filter(field => field.fieldId !== fieldId));
        alert('Направление удалено');
      } else {
        alert('Ошибка при удалении направления');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка при удалении');
    }
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
        {userRole === ('ADMIN' || 'MANAGER') && (
          <button
            onClick={handleCreate}
            style={{ backgroundColor: 'green', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '10px' }}
          >
            Создать
          </button>
        )}
      </form>
      <table className="fields-table">
        <thead>
          <tr>
            <th>Код напрваления</th>
            <th>Наименование напрваления</th>
            <th>Квалификация </th>
            <th>Длительность</th>
            {userRole === ('ADMIN' || 'MANAGER')
            && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {filteredFields.map(field => (
            <tr key={field.fieldId} onClick={() => handleFieldClick(field.fieldId)} style={{ cursor: 'pointer' }}>
              <td>{field.fieldCode}</td>
              <td>{field.fieldName}</td>
              <td>{field.degreeLevel}</td>
              <td>{field.studyLength} года</td>
              {userRole === ('ADMIN' || 'MANAGER')&& (
                <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(field.fieldId)}
                    style={{ backgroundColor: 'orange', color: 'white', marginRight: '5px', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(field.fieldId)}
                    style={{ backgroundColor: 'red', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h3>{isEditing ? 'Изменить направление' : 'Создать направление'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label>Код направления:</label>
                <input type="text" name="fieldCode" value={formData.fieldCode} onChange={handleInputChange} style={{ width: '100%', padding: '5px', borderColor: errors.fieldCode ? 'red' : '#ccc', borderWidth: '1px', borderStyle: 'solid' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Наименование:</label>
                <input type="text" name="fieldName" value={formData.fieldName} onChange={handleInputChange} style={{ width: '100%', padding: '5px', borderColor: errors.fieldName ? 'red' : '#ccc', borderWidth: '1px', borderStyle: 'solid' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Квалификация:</label>
                <input type="text" name="degreeLevel" value={formData.degreeLevel} onChange={handleInputChange} style={{ width: '100%', padding: '5px', borderColor: errors.degreeLevel ? 'red' : '#ccc', borderWidth: '1px', borderStyle: 'solid' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Профиль:</label>
                <input type="text" name="profileName" value={formData.profileName} onChange={handleInputChange} style={{ width: '100%', padding: '5px', borderColor: errors.profileName ? 'red' : '#ccc', borderWidth: '1px', borderStyle: 'solid' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Длительность:</label>
                <input type="number" name="studyLength" value={formData.studyLength} onChange={handleInputChange} style={{ width: '100%', padding: '5px', borderColor: errors.studyLength ? 'red' : '#ccc', borderWidth: '1px', borderStyle: 'solid' }} />
              </div>
              <button type="submit" style={{ backgroundColor: 'green', color: 'white', padding: '10px', border: 'none', borderRadius: '3px', marginRight: '10px' }}>{isEditing ? 'Изменить' : 'Создать'}</button>
              <button type="button" onClick={closeModal} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', border: 'none', borderRadius: '3px' }}>Отмена</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FieldsList;
