import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Plus, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <Trophy className="header__logo-icon" />
          <span className="header__logo-text">TourneyPro</span>
        </Link>
        
        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/" className="header__nav-link">
                Home
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/tournament/create" className="header__nav-link header__nav-link--create">
                <Plus size={16} />
                <span>Create Tournament</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <button 
          className="header__theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;