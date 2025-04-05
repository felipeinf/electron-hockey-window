import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import styled from '@emotion/styled';
import { PullRequest, mapPullRequest } from '../types/github';

const HockeyContainer = styled.div`
  background: rgba(28, 33, 40, 0.95);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  -webkit-app-region: drag;
  max-height: 80vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const PRItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-app-region: no-drag;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
`;

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const HockeyWindow: React.FC = () => {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const token = await window.electron.getGithubToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.pulls.list({
          owner: 'tu-organizacion',
          repo: 'tu-repo',
          state: 'open',
          sort: 'updated',
          direction: 'desc',
          per_page: 5
        });

        setPrs(data.map(mapPullRequest));
      } catch (error) {
        console.error('Error fetching PRs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, []);

  const openPR = (url: string) => {
    window.electron.openExternal(url);
  };

  if (loading) {
    return (
      <HockeyContainer>
        <p>Cargando PRs...</p>
      </HockeyContainer>
    );
  }

  if (prs.length === 0) {
    return (
      <HockeyContainer>
        <p>No hay PRs pendientes</p>
      </HockeyContainer>
    );
  }

  return (
    <HockeyContainer>
      {prs.map(pr => (
        <PRItem key={pr.id} onClick={() => openPR(pr.html_url)}>
          <Title>{pr.title}</Title>
          <Meta>
            #{pr.number} por {pr.user.login} • 
            {new Date(pr.updated_at).toLocaleDateString()}
          </Meta>
        </PRItem>
      ))}
    </HockeyContainer>
  );
};

export default HockeyWindow; 