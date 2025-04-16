import styled from '@emotion/styled';

interface ButtonProps {
  fullWidth?: boolean;
}

const Button = styled.button<ButtonProps>`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #2980b9;
  }
  
  width: ${(props: ButtonProps) => props.fullWidth ? '100%' : 'auto'};
`;

export default Button; 