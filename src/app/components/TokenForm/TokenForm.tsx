import React from 'react';
import styled from '@emotion/styled';
import Button from '../ui/Button';

export const TokenFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
`;

export const TokenInput = styled.input`
  width: 100%;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  margin-top: 5px;
  font-family: monospace;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  margin-top: 16px;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: space-between;
`;

interface TokenFormProps {
  token: string;
  onTokenChange: (token: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGenerateToken: () => void;
  onDeleteToken: () => void;
}

const TokenForm: React.FC<TokenFormProps> = ({
  token,
  onTokenChange,
  onSubmit,
  onGenerateToken,
  onDeleteToken
}) => {
  return (
    <TokenFormContainer id="settings-form" onSubmit={onSubmit}>
      <h2 style={{ margin: '0 0 8px 0' }}>Configuración</h2>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
        Ingresa tu token de acceso personal de GitHub con permisos para leer PRs.
      </p>
      <label>
        Token de GitHub
        <TokenInput
          type="text"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="ghp_XXXXXXXXXXXXXXXX"
          required
        />
      </label>
      
      <ButtonsContainer>
        <Button 
          type="submit" 
          style={{ 
            background: '#2c3e50', 
            borderColor: '#34495e',
            fontSize: '14px',
            padding: '8px 16px',
            flex: '1',
            maxWidth: '33%'
          }}
        >
          Guardar
        </Button>
        
        <Button 
          type="button" 
          onClick={onGenerateToken} 
          style={{ 
            background: '#3a3a3a', 
            borderColor: '#444',
            fontSize: '14px',
            padding: '8px 16px',
            flex: '1',
            maxWidth: '33%'
          }}
        >
          Generar Token
        </Button>
        
        <Button 
          type="button" 
          onClick={onDeleteToken} 
          style={{ 
            background: 'transparent',
            color: '#ff6b6b',
            borderColor: '#ff6b6b',
            border: '1px solid',
            fontSize: '14px',
            padding: '8px 16px',
            flex: '1',
            maxWidth: '33%'
          }}
        >
          Eliminar Token
        </Button>
      </ButtonsContainer>
    </TokenFormContainer>
  );
};

export default TokenForm; 