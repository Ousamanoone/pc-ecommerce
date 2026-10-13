import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themes = ['dark', 'light', 'cyberpunk', 'synthwave', 'night', 'corporate'];

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <Palette className="w-5 h-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-300 rounded-box w-40 border border-base-content/10 mt-2"
      >
        {themes.map((t) => (
          <li key={t}>
            <button
              className={`capitalize text-xs font-semibold ${theme === t ? 'active font-bold text-primary' : ''}`}
              onClick={() => setTheme(t)}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSelector;