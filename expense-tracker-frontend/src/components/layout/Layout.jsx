import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-zinc-800 antialiased selection:bg-zinc-900 selection:text-white pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {children}
      </main>
    </div>
  );
}