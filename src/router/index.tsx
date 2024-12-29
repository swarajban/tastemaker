// src/router/index.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ViewSchedulesPage from '../pages/ViewSchedulesPage';
import AddMealItemPage from '../pages/AddMealItemPage';
import EditMealItemPage from '../pages/EditMealItemPage';
import ViewMealItemsPage from '../pages/ViewMealItemsPage';
import CreateSchedulePage from '../pages/CreateSchedulePage';
import PrivateRoute from './PrivateRoute';


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no Layout) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Private routes under the Layout */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="meal-items" element={<ViewMealItemsPage />} />
            <Route path="add-meal-item" element={<AddMealItemPage />} />
            <Route path="edit-meal-item/:mealItemId" element={<EditMealItemPage />} />
            <Route path="schedules" element={<ViewSchedulesPage />} />
            <Route path="create-schedule" element={<CreateSchedulePage />} />
          </Route>
        </Route>
        
        {/* Optional: 404 fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
