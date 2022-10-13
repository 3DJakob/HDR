import React from 'react'
import styled from 'styled-components'

const StyledButton = styled.div`
  background-color: #363531;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  height: 25.5px;
  margin: 5px;
  padding: 0 20px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  :hover {
    background-color: #4a4a4a;
  }
`

export interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <StyledButton onClick={onClick}>
      {children}
    </StyledButton>
  )
}

export default Button
