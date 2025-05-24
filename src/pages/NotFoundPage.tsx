import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <Trophy size={64} className="not-found__icon" />
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__subtitle">Page Not Found</h2>
        <p className="not-found__message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found__link">
          <Home size={18} />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;