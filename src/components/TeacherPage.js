import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TeacherPage.css';

function TeacherPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const teacher = location.state?.teacher;

  const handleBack = () => {
    navigate(-1);
  };

  if (!teacher) {
    return (
      <div className="teacher-page">
        <button onClick={handleBack} className="back-button">Назад</button>
        <div>Информация о преподавателе не найдена</div>
      </div>
    );
  }

  return (
    <div className="teacher-page">
      <button onClick={handleBack} className="back-button">Назад</button>
      <h1>Информация о преподавателе</h1>
      <div className="teacher-details">
        <h2>{teacher.fio}</h2>
        <div className="teacher-info-grid">
          <div className="info-item">
            <strong>Роль:</strong> {teacher.role}
          </div>
          {teacher.department && (
            <div className="info-item">
              <strong>Кафедра:</strong> {teacher.department}
            </div>
          )}
          {teacher.post && (
            <div className="info-item">
              <strong>Должность:</strong> {teacher.post}
            </div>
          )}
          {teacher.academicStatus && (
            <div className="info-item">
              <strong>Ученое звание:</strong> {teacher.academicStatus}
            </div>
          )}
          {teacher.academicDegree && (
            <div className="info-item">
              <strong>Ученая степень:</strong> {teacher.academicDegree}
            </div>
          )}
          {teacher.email && (
            <div className="info-item">
              <strong>Email:</strong> <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
            </div>
          )}
          {teacher.phone && (
            <div className="info-item">
              <strong>Телефон:</strong> {teacher.phone}
            </div>
          )}
          {teacher.information && (
            <div className="info-item">
              <strong>Дополнительная информация:</strong> {teacher.information}
            </div>
          )}
          <div className="info-item">
            <strong>Назначенные часы:</strong> {teacher.hoursAssigned}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
