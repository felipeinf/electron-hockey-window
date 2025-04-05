import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import styled from '@emotion/styled';
import { Button } from '@nextui-org/react';
import { PullRequest } from './types/github';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TitleBar = styled.div`
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TitleText = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-app-region: no-drag;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const Content = styled.div`
  padding: 16px;
`;

const TokenInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 13px;
  -webkit-app-region: no-drag;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const StyledText = styled.p<{ small?: boolean; muted?: boolean }>`
  color: ${props => props.muted ? 'rgba(255, 255, 255, 0.5)' : 'white'};
  margin: ${props => props.small ? '4px 0' : '8px 0'};
  font-size: ${props => props.small ? '12px' : '13px'};
`;

const PRList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PRItem = styled.div<{ isOwn: boolean }>`
  background: ${props => props.isOwn ? 'rgba(88, 166, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.isOwn ? 'rgba(88, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  -webkit-app-region: no-drag;
  
  &:hover {
    background: ${props => props.isOwn ? 'rgba(88, 166, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const PRInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding-right: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const StyledButton = styled(Button)`
  -webkit-app-region: no-drag !important;
  font-size: 12px !important;
  height: 28px !important;
  min-width: unset !important;
  padding: 0 12px !important;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ConfigButton = styled(StyledButton)`
  padding: 0 8px !important;
  height: 24px !important;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.6) !important;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
`;

const Hockey: React.FC = () => {
  const [token, setToken] = useState('');
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const loadToken = async () => {
      try {
        console.log('Intentando cargar token...');
        const savedToken = await window.electron.getGithubToken();
        console.log('Token cargado:', savedToken ? 'Existe' : 'No existe');
        if (savedToken) {
          setToken(savedToken);
          setShowConfig(false);
          fetchPRs(savedToken);
        }
      } catch (err) {
        console.error('Error al cargar token:', err);
        setError('Error al cargar el token de GitHub');
      }
    };
    loadToken();
  }, []);

  const handleTokenSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      console.log('Guardando token...');
      await window.electron.setGithubToken(token);
      console.log('Token guardado');
      setShowConfig(false);
      fetchPRs(token);
    } catch (err) {
      console.error('Error al guardar token:', err);
      setError('Error al guardar el token');
    }
  };

  const fetchPRs = async (currentToken: string) => {
    if (!currentToken) {
      setError('Por favor ingresa tu token de GitHub');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: currentToken });
      
      // Obtener usuario actual
      const { data: user } = await octokit.users.getAuthenticated();
      setCurrentUser(user.login);
      console.log('Usuario autenticado:', user.login);

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
              id: pr.id,
              number: pr.number,
              title: pr.title,
              html_url: pr.html_url,
              user: {
                login: pr.user?.login || 'unknown'
              },
              created_at: pr.created_at,
              updated_at: pr.updated_at,
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
    } catch (err: any) {
      console.error('Error al cargar PRs:', err);
      if (err.status === 401) {
        setError('Token inválido. Por favor verifica tu token de GitHub.');
      } else {
        setError('Error al cargar los PRs: ' + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pr: PullRequest) => {
    try {
      const octokit = new Octokit({ auth: token });
      const [owner, repo] = pr.repoName.split('/');

      await octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pr.number,
        event: 'APPROVE'
      });

      // Recargar PRs después de aprobar
      fetchPRs(token);
    } catch (err) {
      console.error('Error al aprobar PR:', err);
      setError('Error al aprobar el PR');
    }
  };

  return (
    <AppContainer>
      <TitleBar>
        <TitleText>Hockey PR</TitleText>
        {!showConfig && (
          <ConfigButton 
            size="sm"
            onClick={() => setShowConfig(true)}
          >
            ⚙️
          </ConfigButton>
        )}
      </TitleBar>
      <ScrollContainer>
        <Content>
          {showConfig ? (
            <form onSubmit={handleTokenSubmit}>
              <StyledText>Token de GitHub</StyledText>
              <TokenInput
                type="password"
                placeholder="Ingresa tu token personal de GitHub"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <StyledButton 
                color="primary"
                onClick={handleTokenSubmit}
                style={{ marginTop: '12px' }}
              >
                Guardar
              </StyledButton>
            </form>
          ) : (
            <>
              {loading ? (
                <StyledText>Cargando pull requests...</StyledText>
              ) : error ? (
                <StyledText style={{ color: '#ff4d4d' }}>{error}</StyledText>
              ) : prs.length === 0 ? (
                <StyledText muted>No hay pull requests abiertos</StyledText>
              ) : (
                <PRList>
                  {prs.map(pr => (
                    <PRItem 
                      key={pr.id}
                      isOwn={pr.isOwn}
                    >
                      <PRInfo onClick={() => window.open(pr.html_url, '_blank')}>
                        <StyledText small muted>{pr.repoName}</StyledText>
                        <StyledText>{pr.title}</StyledText>
                        <StyledText small muted>
                          #{pr.number} por {pr.user.login} • 
                          {new Date(pr.updated_at).toLocaleDateString()}
                        </StyledText>
                      </PRInfo>
                      <ActionButtons>
                        <StyledButton
                          size="sm"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(pr);
                          }}
                        >
                          ✓ Aprobar
                        </StyledButton>
                      </ActionButtons>
                    </PRItem>
                  ))}
                </PRList>
              )}
            </>
          )}
        </Content>
      </ScrollContainer>
    </AppContainer>
  );
};

export default Hockey; 