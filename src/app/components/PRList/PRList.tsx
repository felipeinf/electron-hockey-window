import React from 'react';
import styled from '@emotion/styled';
import { PullRequest } from '../../types';
import PRCard from './PRCard';
import Button from '../ui/Button';
import StatusMessage from '../ui/StatusMessage';

interface PRListProps {
  pullRequests: PullRequest[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onPRClick: (url: string) => void;
}

const PRListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RefreshIcon = styled.div`
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const PRList: React.FC<PRListProps> = ({ 
  pullRequests, 
  loading, 
  error, 
  onRefresh, 
  onPRClick 
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="3.5" r="1.5"><animateTransform attributeName="transform" calcMode="discrete" dur="2.4s" repeatCount="indefinite" type="rotate" values="0 12 12;90 12 12;180 12 12;270 12 12"/><animate attributeName="opacity" dur="0.6s" repeatCount="indefinite" values="1;1;0"/></circle><circle cx="12" cy="3.5" r="1.5" transform="rotate(30 12 12)"><animateTransform attributeName="transform" begin="0.2s" calcMode="discrete" dur="2.4s" repeatCount="indefinite" type="rotate" values="30 12 12;120 12 12;210 12 12;300 12 12"/><animate attributeName="opacity" begin="0.2s" dur="0.6s" repeatCount="indefinite" values="1;1;0"/></circle><circle cx="12" cy="3.5" r="1.5" transform="rotate(60 12 12)"><animateTransform attributeName="transform" begin="0.4s" calcMode="discrete" dur="2.4s" repeatCount="indefinite" type="rotate" values="60 12 12;150 12 12;240 12 12;330 12 12"/><animate attributeName="opacity" begin="0.4s" dur="0.6s" repeatCount="indefinite" values="1;1;0"/></circle></g></svg></div>
        <div>Cargando pull requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <StatusMessage>{error}</StatusMessage>
        <Button 
          onClick={onRefresh}
          style={{ 
            marginTop: '12px', 
            alignSelf: 'center',
            background: '#2c3e50',
            borderColor: '#34495e' 
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <PRListContainer>
      <TitleContainer>
        <h2>Pull Requests</h2>
        <RefreshIcon onClick={onRefresh}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="2 4" stroke-dashoffset="6" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9"><animate attributeName="stroke-dashoffset" dur="0.6s" repeatCount="indefinite" values="6;0"/></path><path stroke-dasharray="32" stroke-dashoffset="32" d="M12 21c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.1s" dur="0.4s" values="32;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M12 8v7.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="10;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 15.5l3.5 -3.5M12 15.5l-3.5 -3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="6;0"/></path></g></svg>
        </RefreshIcon>
      </TitleContainer>
      
      {pullRequests.length === 0 ? (
        <StatusMessage>No se encontraron pull requests</StatusMessage>
      ) : (
        pullRequests.map(pr => (
          <PRCard 
            key={pr.id}
            pullRequest={pr}
            onClick={onPRClick}
          />
        ))
      )}
    </PRListContainer>
  );
};

export default PRList; 