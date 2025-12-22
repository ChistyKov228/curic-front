import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import FieldsList from './components/StudyPlansList';
import CurriculaPage from './components/CurriculaPage';
import TeacherPage from './components/TeacherPage';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<FieldsList />} />
        <Route path="/curricula/:fieldId" element={<CurriculaPage />} />
        <Route path="/teacher/:teacherId" element={<TeacherPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
