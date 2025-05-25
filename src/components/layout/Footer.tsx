import React from 'react';
import { Trophy } from 'lucide-react';

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
          <a href="#" className="footer__link">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;