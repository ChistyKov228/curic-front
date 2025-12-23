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

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    fetch(`http://localhost:8080/api/curricula/${fieldId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          // Treat 404 as not found, simulate error response
          return { status: 'error', error: 'Учебный план не найден' };
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .then(data => {
        if (data.status === 'success') {
          setCurricula(data.data);
        } else if (data.status === 'error') {
          // For not found, don't set error, just leave curricula as null
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
        // Refetch the curricula to get updated data
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
    // Assuming curricula has studyPlanId
    const planId = curricula.studyPlanId;
    const id = curricula.fieldOfStudy.fieldId;
    // Map disciplines to the required format for blocks
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
          <button onClick={handleDownload} className="download-button" style={{ backgroundColor: 'green', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Скачать учебный план</button>
          {userRole === 'ADMIN' && (
            <button onClick={handleArchive} className="archive-button" style={{ backgroundColor: 'purple', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '10px' }}>
              {curricula.archiveStatus === true ? 'Разархивировать' : 'Архивировать'}
            </button>
          )}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <button onClick={handleDelete} className="delete-button" style={{ backgroundColor: 'red', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '10px' }}>
              Удалить учебный план
            </button>
          )}
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
    </div>
  );
}

export default CurriculaPage;
