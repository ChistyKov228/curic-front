import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CurriculaPage.css';

function CurriculaPage() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [curricula, setCurricula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/curricula/${fieldId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          setCurricula(data.data);
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




  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="curricula-page">
      <button onClick={handleBack} className="back-button">Назад</button>
      {curricula && (
        <div className="curricula-details">
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>{curricula.studyPlanName}</h2>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>Курс: {curricula.course}</p>
          <p style={{ fontSize: '20px', marginBottom: '10px' }}>Годы: {curricula.yearStart} - {curricula.yearEnd}</p>
          <p style={{ fontSize: '20px', marginBottom: '20px' }}>Статус: {curricula.status}</p>
          <button onClick={handleDownload} className="download-button">Скачать учебный план</button>
          <h3 style={{ fontSize: '28px', marginBottom: '10px' }}>Направление:</h3>
          <p style={{ fontSize: '20px', marginBottom: '30px' }}>{curricula.fieldOfStudy.fieldCode} - {curricula.fieldOfStudy.fieldName}</p>
          <h3 style={{ fontSize: '28px', marginBottom: '20px' }}>Дисциплины:</h3>
          <div className="disciplines-list">
            {curricula.disciplines.map(discipline => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurriculaPage;
