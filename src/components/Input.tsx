import React from 'react'
import styled from 'styled-components'

const StyledInput = styled.input`
  padding: 5px;
  border-radius: 20px;
  border: none;
  margin: 5px;
`

export interface InputProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

const Input: React.FC<InputProps> = ({ value, placeholder, onChange }) => {
  return (
    <StyledInput
      type='text'
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default Input
