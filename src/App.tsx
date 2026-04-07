import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import './index.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Calendar theme={theme} toggleTheme={toggleTheme} />
  );
}

export default App;
