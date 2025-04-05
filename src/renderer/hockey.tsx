import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import styled from '@emotion/styled';
import { PullRequest, mapPullRequest } from './types/github';

const Container = styled.div`
  background: rgba(30, 30, 30, 0.9);
  color: white;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  max-height: 500px;
  overflow-y: auto;
  -webkit-app-region: drag;
`;

interface PRItemProps {
  isOwn: boolean;
}

const PRItem = styled.div<PRItemProps>`
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  -webkit-app-region: no-drag;
  background: ${props => props.isOwn ? 'rgba(88, 166, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RepoName = styled.div`
  font-size: 0.8em;
  color: #8b949e;
  margin-bottom: 2px;
`;

const Title = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const Meta = styled.div`
  font-size: 0.8em;
  color: #8b949e;
`;

const ConfigButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  -webkit-app-region: no-drag;
  
  &:hover {
    color: white;
  }
`;

const TokenInput = styled.input`
  width: calc(100% - 16px);
  padding: 8px;
  margin: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  -webkit-app-region: no-drag;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Hockey: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await window.electron.getGithubToken();
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (err) {
        console.error('Error loading token:', err);
      }
    };
    loadToken();
  }, []);

  const fetchAllPRs = async () => {
    if (!token) return;

    setLoading(true);
    
    try {
      const octokit = new Octokit({ auth: token });
      
      // Obtener el usuario actual
      const { data: user } = await octokit.users.getAuthenticated();
      setCurrentUser(user.login);
      
      // Obtener los repositorios del usuario
      const { data: userRepos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      });

      // Obtener repositorios de organizaciones
      const { data: orgs } = await octokit.orgs.listForAuthenticatedUser();
      const orgRepos = await Promise.all(
        orgs.map(async (org) => {
          const { data: repos } = await octokit.repos.listForOrg({
            org: org.login,
            per_page: 100
          });
          return repos;
        })
      );

      // Combinar todos los repositorios
      const allRepos = [
        ...userRepos,
        ...orgRepos.flat()
      ];

      // Obtener PRs de cada repositorio
      const allPRs = await Promise.all(
        allRepos.map(async (repo) => {
          if (!repo.permissions?.pull) return [];
          
          try {
            const { data: repoPRs } = await octokit.pulls.list({
              owner: repo.owner.login,
              repo: repo.name,
              state: 'open',
              sort: 'updated',
              direction: 'desc'
            });
            return repoPRs.map(pr => ({
              ...mapPullRequest(pr),
              repoName: `${repo.owner.login}/${repo.name}`,
              isOwn: pr.user?.login === user.login
            }));
          } catch (err) {
            console.error(`Error fetching PRs for ${repo.full_name}:`, err);
            return [];
          }
        })
      );

      // Aplanar y ordenar los PRs
      const flatPRs = allPRs
        .flat()
        .sort((a, b) => {
          // Primero ordenar por si es propio o no
          if (a.isOwn && !b.isOwn) return -1;
          if (!a.isOwn && b.isOwn) return 1;
          // Luego por fecha
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      
      setPrs(flatPRs);
      await window.electron.setGithubToken(token);
    } catch (err) {
      console.error('Error fetching PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllPRs();
      // Actualizar cada 5 minutos
      const interval = setInterval(fetchAllPRs, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await window.electron.setGithubToken(token);
    setShowConfig(false);
    fetchAllPRs();
  };

  return (
    <Container>
      <ConfigButton onClick={() => setShowConfig(!showConfig)}>⚙️</ConfigButton>
      
      {showConfig ? (
        <form onSubmit={handleTokenSubmit}>
          <TokenInput
            type="password"
            placeholder="Ingresa tu GitHub Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </form>
      ) : loading ? (
        <div>Cargando PRs...</div>
      ) : (
        prs.map(pr => (
          <PRItem key={pr.id} isOwn={pr.isOwn} onClick={() => window.open(pr.html_url)}>
            <RepoName>{pr.repoName}</RepoName>
            <Title>{pr.title}</Title>
            <Meta>
              #{pr.number} por {pr.user.login} • 
              {new Date(pr.updated_at).toLocaleDateString()}
            </Meta>
          </PRItem>
        ))
      )}
    </Container>
  );
};

export default Hockey; 