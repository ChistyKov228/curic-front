import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CurriculaPage.css';

function CurriculaPage() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    disciplineId: '',
    currentTerm: '',
    newTerm: '',
    newTermHours: '',
    teacherId: '',
    teacherRole: '',
    hoursAssigned: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    fetch(`http://localhost:8080/api/curricula/${fieldId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return { status: 'error', error: 'Учебный план не найден' };
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .then(data => {
        if (data.status === 'success') {
          setCurricula(data.data);
        } else if (data.status === 'error') {
          setCurricula(null);
        } else {
          throw new Error('Data fetch failed');
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [fieldId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleDownload = () => {
    fetch(`http://localhost:8080/api/curricula/${fieldId}/pdf`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `curricula_${fieldId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  };

  const handleUpdateContent = () => {
    if (curricula && curricula.disciplines && curricula.disciplines.length > 0) {
      const discipline = curricula.disciplines[0];
      const teacher = discipline.teachers && discipline.teachers.length > 0 ? discipline.teachers[0] : null;
      setUpdateForm({
        disciplineId: discipline.disciplineId.toString(),
        currentTerm: discipline.term.toString(),
        newTerm: discipline.term.toString(),
        newTermHours: discipline.totalHours.toString(),
        teacherId: teacher ? teacher.teacherId.toString() : '',
        teacherRole: teacher ? teacher.role : 'lecturer',
        hoursAssigned: teacher ? '36' : '' // default if no teacher
      });
    } else {
      setUpdateForm({
        disciplineId: '',
        currentTerm: '',
        newTerm: '',
        newTermHours: '',
        teacherId: '',
        teacherRole: 'lecturer',
        hoursAssigned: ''
      });
    }
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();

    const disciplineId = parseInt(updateForm.disciplineId);
    const currentTerm = parseInt(updateForm.currentTerm);
    const newTerm = parseInt(updateForm.newTerm);
    const newTermHours = parseInt(updateForm.newTermHours);
    const teacherId = parseInt(updateForm.teacherId);
    const hoursAssigned = parseInt(updateForm.hoursAssigned);

    if (isNaN(disciplineId) || isNaN(currentTerm) || isNaN(newTerm) || isNaN(newTermHours) || isNaN(teacherId) || isNaN(hoursAssigned)) {
      alert('Все числовые поля должны быть заполнены корректно');
      return;
    }

    const newTeachers = [{
      teacherId,
      teacherRole: updateForm.teacherRole,
      hoursAssigned
    }];

    const updateData = {
      updates: [{
        disciplineId,
        currentTerm,
        newTerm,
        newTermHours,
        newTeachers
      }]
    };

    const token = localStorage.getItem('token');
    const planId = curricula.studyPlanId;
    const id = curricula.fieldOfStudy.fieldId;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/fields/${id}/study-plans/${planId}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const refetchResponse = await fetch(`http://localhost:8080/api/curricula/${fieldId}`);
        if (refetchResponse.ok) {
          const refetchData = await refetchResponse.json();
          if (refetchData.status === 'success') {
            setCurricula(refetchData.data);
          }
        }
        setShowUpdateModal(false);
        setUpdateForm({
          disciplineId: '',
          currentTerm: '',
          newTerm: '',
          newTermHours: '',
          teacherId: '',
          teacherRole: '',
          hoursAssigned: ''
        });
        alert('Контент обновлен');
      } else {
        alert('Ошибка при обновлении контента');
      }
    } catch (error) {
      console.error('Update content failed:', error);
      alert('Ошибка при обновлении контента');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Вы уверены, что хотите изменить статус архивации учебного плана?')) return;

    const token = localStorage.getItem('token');
    const planId = curricula.studyPlanId;
    const id = curricula.fieldOfStudy.fieldId;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/fields/${id}/study-plans/${planId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const refetchResponse = await fetch(`http://localhost:8080/api/curricula/${fieldId}`);
        if (refetchResponse.ok) {
          const refetchData = await refetchResponse.json();
          if (refetchData.status === 'success') {
            setCurricula(refetchData.data);
          }
        }
        alert('Статус архивации изменен');
      } else {
        alert('Ошибка при изменении статуса архивации');
      }
    } catch (error) {
      console.error('Archive failed:', error);
      alert('Ошибка при изменении статуса архивации');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот учебный план?')) return;

    const token = localStorage.getItem('token');
    const planId = curricula.studyPlanId;
    const id = curricula.fieldOfStudy.fieldId;
    const blocks = curricula.disciplines.map(discipline => ({
      disciplineId: discipline.disciplineId,
      term: discipline.term
    }));
    try {
      const response = await fetch(`http://localhost:8080/api/admin/fields/${id}/study-plans/${planId}/content`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blocks })
      });
      if (response.ok) {
             
        try {
          const deleteResponse = await fetch(`http://localhost:8080/api/admin/fields/${id}/study-plans/${planId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (deleteResponse.ok) {
            navigate('/');
          } else {
            alert('Ошибка при удалении учебного плана');
          }
        } catch (deleteError) {
          console.error('Delete plan failed:', deleteError);
          alert('Ошибка при удалении учебного плана');
        }
      } else {
        alert('Ошибка при удалении контента учебного плана');
      }
    }
    catch (error) {
      console.error('Delete content failed:', error);
      alert('Ошибка при удалении контента учебного плана');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="curricula-page">
      <button onClick={handleBack} className="back-button">Назад</button>
      <div className="curricula-details">
        {curricula ? (
          <>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>{curricula.studyPlanName}</h2>
            <p style={{ fontSize: '20px', marginBottom: '10px' }}>Курс: {curricula.course}</p>
            <p style={{ fontSize: '20px', marginBottom: '10px' }}>Годы: {curricula.yearStart} - {curricula.yearEnd}</p>
            <p style={{ fontSize: '20px', marginBottom: '20px' }}>Статус: {curricula.status}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              <button onClick={handleDownload} className="download-button" style={{ backgroundColor: 'green', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Скачать учебный план</button>
              {userRole === 'ADMIN' && (
                <button onClick={handleUpdateContent} className="update-button" style={{ backgroundColor: 'blue', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                  Обновить контент
                </button>
              )}
              {userRole === 'ADMIN' && (
                <button onClick={handleArchive} className="archive-button" style={{ backgroundColor: 'purple', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                  {curricula.status === 'ARCHIVED' ? 'Разархивировать' : 'Архивировать'}
                </button>
              )}
              {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <button onClick={handleDelete} className="delete-button" style={{ backgroundColor: 'red', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                  Удалить учебный план
                </button>
              )}
            </div>
            <h3 style={{ fontSize: '28px', marginBottom: '10px' }}>Направление:</h3>
            <p style={{ fontSize: '20px', marginBottom: '30px' }}>{curricula.fieldOfStudy.fieldCode} - {curricula.fieldOfStudy.fieldName}</p>
            <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>Дисциплины:</h3>
            <div className="disciplines-list">
              {curricula.disciplines && curricula.disciplines.length > 0 ? (
                curricula.disciplines.map(discipline => (
                  <div key={discipline.disciplineId} className="discipline-card">
                    <h4>{discipline.disciplineName}</h4>
                    <p>Семестр: {discipline.term}</p>
                    <p>Общее часы: {discipline.totalHours}</p>
                    <p>Отчет: {discipline.report}</p>
                    <h5>Преподаватели:</h5>
                    <ul>
                      {discipline.teachers.map(teacher => (
                        <li key={teacher.teacherId} className="teacher-item">
                          <div className="teacher-info">
                            <span
                              onClick={() => navigate(`/teacher/${teacher.teacherId}`, { state: { teacher } })}
                              style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                            >
                              {teacher.fio} ({teacher.role})
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>Пока нет учебного плана</p>
              )}
            </div>
          </>
        ) : (
          <p>Пока нет учебного плана</p>
        )}
      </div>

      {showUpdateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '500px' }}>
            <h3>Обновить контент учебного плана</h3>
            <form onSubmit={handleSubmitUpdate}>
              <div style={{ marginBottom: '10px' }}>
                <label>Discipline ID:</label>
                <input type="number" name="disciplineId" value={updateForm.disciplineId} onChange={(e) => setUpdateForm(prev => ({ ...prev, disciplineId: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Current Term:</label>
                <input type="number" name="currentTerm" value={updateForm.currentTerm} onChange={(e) => setUpdateForm(prev => ({ ...prev, currentTerm: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>New Term:</label>
                <input type="number" name="newTerm" value={updateForm.newTerm} onChange={(e) => setUpdateForm(prev => ({ ...prev, newTerm: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>New Term Hours:</label>
                <input type="number" name="newTermHours" value={updateForm.newTermHours} onChange={(e) => setUpdateForm(prev => ({ ...prev, newTermHours: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Teacher ID:</label>
                <input type="number" name="teacherId" value={updateForm.teacherId} onChange={(e) => setUpdateForm(prev => ({ ...prev, teacherId: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Teacher Role:</label>
                <input type="text" name="teacherRole" value={updateForm.teacherRole} onChange={(e) => setUpdateForm(prev => ({ ...prev, teacherRole: e.target.value }))} placeholder="lecturer" required style={{ width: '100%', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Hours Assigned:</label>
                <input type="number" name="hoursAssigned" value={updateForm.hoursAssigned} onChange={(e) => setUpdateForm(prev => ({ ...prev, hoursAssigned: e.target.value }))} required style={{ width: '100%', padding: '5px' }} />
              </div>
              <button type="submit" style={{ backgroundColor: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '3px', marginRight: '10px', marginTop: '10px' }}>Обновить</button>
              <button type="button" onClick={() => { setShowUpdateModal(false); setUpdateForm({ disciplineId: '', currentTerm: '', newTerm: '', newTermHours: '', teacherId: '', teacherRole: '', hoursAssigned: '' }); }} style={{ backgroundColor: 'gray', color: 'white', padding: '10px', border: 'none', borderRadius: '3px', marginTop: '10px' }}>Отмена</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CurriculaPage;
