'use client';

import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';

export default function ClientThemeProvider({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}