import React from 'react';
import styled from '@emotion/styled';
import { PullRequest } from '../../types';

export const PRCardContainer = styled.div`
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(50, 50, 50, 0.7);
    transform: translateY(-2px);
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #aaa;
  }
`;

interface PRCardProps {
  pullRequest: PullRequest;
  onClick: (url: string) => void;
}

const PRCard: React.FC<PRCardProps> = ({ pullRequest, onClick }) => {
  return (
    <PRCardContainer onClick={() => onClick(pullRequest.url)}>
      <h3>{pullRequest.title}</h3>
      <p>{pullRequest.repo} • {pullRequest.author}</p>
    </PRCardContainer>
  );
};

export default PRCard; 