import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsAppButton from '../ui/FloatingWhatsAppButton';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const offsetPages = [
    '/contact',
    '/candidate/register',
    '/candidate/login',
    '/employer/register',
    '/employer/login',
    '/admin/login'
  ];
  const showTopOffset = offsetPages.includes(pathname) || pathname.startsWith('/blog');

  return (
    <>
      <Navbar />
      <main className={showTopOffset ? 'public-page-with-fixed-header' : ''}>
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
