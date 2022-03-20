import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const NavBar = () => {
  return (
    <header className="d-flex flex-wrap align-items-center justify-content-between justify-content-md-between mt-3">
      <a
        href="/"
        className="d-flex align-items-center col-md-3 mb-md-0 text-decoration-none heading active nav-link"
      >
        <img className="logo" alt="BAMfers" src="/images/logo.png" />
      </a>
      <div className="nav">
        <div className="text-end">
          <div className="social-icons col-sm-3 col-4">
            <a
              href="https://twitter.com/xxxMfers"
              target="_blank"
              rel="noreferrer"
            >
              <img alt="twitter" src="/images/twitter.png" />
            </a>
          </div>
          <div className="social-icons col-sm-3 col-4">
            <a
              href="https://opensea.io/collection/bam-nft"
              target="_blank"
              rel="noreferrer"
            >
              <img alt="opensea" src="/images/opensea.png" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
