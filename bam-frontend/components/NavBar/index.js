import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const NavContainer = styled.div`
  top: -1rem;
  left: 0px;
  right: 0px;
  z-index: 9;
  padding-top: 1rem;
  position: fixed;
  transition: 250ms ease-in-out box-shadow;
`;

const Nav = styled.div`
  position: relative;
  display: flex;
  margin: 2rem;
  margin-top: 3rem;
  z-index: 2;
  justify-content: space-between;
`;

const NavContent = styled.div`
  max-width: 100%;
  display: flex;
`;

const NavItem = styled.div`
  display: flex;
  max-width: 100%;
  position: relative;
  grid-gap: 1rem;
  gap: 1rem;
  align-items: center;
`;

const Img = styled.img`
  width: ${({ width }) => width ?? '10vw'};
`;

const NavBar = () => {
  return (
    <NavContainer className="nav_container">
      <Nav className="nav">
        <NavContent className="nav_content">
          <NavItem className="nav_item">
            <Img alt="logo" src="/images/logo.png" />
          </NavItem>
        </NavContent>
        <NavContent className="nav_content">
          <NavItem style={{ marginRight: '3rem' }} className="nav_item">
            <a
              href="https://twitter.com/xxxMfers"
              target="_blank"
              rel="noreferrer"
            >
              <Img width="4vw" alt="twitter" src="/images/twitter.png" />
            </a>
          </NavItem>
          <NavItem className="nav_item">
            <a href="#" target="_blank" rel="noreferrer">
              <Img width="4vw" alt="opensea" src="/images/opensea.png" />
            </a>
          </NavItem>
        </NavContent>
      </Nav>
    </NavContainer>
  );
};

export default NavBar;
