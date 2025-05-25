import React from 'react';
import { Trophy, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <Trophy className="footer__logo-icon" />
          <p className="footer__copyright">
            &copy; {year} TourneyBracket. Created by Riuse
          </p>
        </div>
        
        <div className="footer__links">
          <a 
            href="https://github.com/Riuse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer__link"
          >
            <Github size={18} className="footer__icon" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;