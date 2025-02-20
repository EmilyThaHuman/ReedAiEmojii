import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar';

export function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
} 