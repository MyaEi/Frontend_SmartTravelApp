'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  loginUrl: string;
  signupUrl: string;
};

type User = {
  email: string;
  name: string;
  sub: string;
};

export default function Navbar({ loginUrl, signupUrl }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
    
    // Check authentication status
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <nav className="navbar navbar-expand-sm nav w-100">
      <div className="container-fluid mx-md-4 mx-lg-5">
        <Link className="navbar-brand ms-lg-2" href="/">
          <Image src="/capstone/images/travelgpt.png" alt="Logo" width={120} height={80} />
        </Link>
        <h1 className="home-title m-0">Intelligent TravelGPT</h1>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link me-4" href="/contact">Contact Us</Link>
            </li>
            <li className="nav-item">
              <span className="nav-link me-4"><i className="fas fa-dollar-sign" /> CAD</span>
            </li>
            {!loading && (
              user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link me-4">Welcome, {user.name}</span>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="btn btn-link nav-link me-4" 
                      onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        setUser(null);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <a className="nav-link me-4" href={loginUrl}>Sign In</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link me-4" href={signupUrl}>Register</a>
                  </li>
                </>
              )
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
