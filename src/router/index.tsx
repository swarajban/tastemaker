import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ViewSchedulesPage from '../pages/ViewSchedulesPage';
import AddMealItemPage from '../pages/AddMealItemPage';
import EditMealItemPage from '../pages/EditMealItemPage';
import CreateSchedulePage from '../pages/CreateSchedulePage';
import LoginPage from '../pages/LoginPage';


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedules" element={<ViewSchedulesPage />} />
        <Route path="/add-meal-item" element={<AddMealItemPage />} />
        <Route path="/edit-meal-item/:mealItemId" element={<EditMealItemPage />} />
        <Route path="/create-schedule" element={<CreateSchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}
