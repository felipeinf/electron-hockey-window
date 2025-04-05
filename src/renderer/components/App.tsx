import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import styled from '@emotion/styled';
import { PullRequest, mapPullRequest } from '../types/github';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const PRList = styled.ul`
  list-style: none;
  padding: 0;
`;

const PRItem = styled.li`
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const RepoName = styled.div`
  font-size: 0.9em;
  color: #57606a;
  margin-bottom: 4px;
`;

const ErrorMessage = styled.div`
  color: #cf222e;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #cf222e;
  border-radius: 4px;
  background-color: #ffebe9;
`;

const App: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!token) {
      setError('Por favor ingresa tu token de GitHub');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({ auth: token });
      
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
              repoName: `${repo.owner.login}/${repo.name}`
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
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      setPrs(flatPRs);
      await window.electron.setGithubToken(token);
    } catch (err: any) {
      if (err.status === 401) {
        setError('Token inválido. Por favor verifica tu token de GitHub.');
      } else {
        setError('Error al cargar los PRs. ' + (err.message || ''));
      }
      console.error('Error fetching PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllPRs();
    }
  }, [token]);

  return (
    <Container>
      <Header>
        <h1>Hockey PR</h1>
        <Input
          type="password"
          placeholder="Ingresa tu GitHub Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Header>
      
      <main>
        {loading ? (
          <div>Cargando PRs...</div>
        ) : (
          <PRList>
            {prs.map(pr => (
              <PRItem key={pr.id}>
                <RepoName>{pr.repoName}</RepoName>
                <h3>{pr.title}</h3>
                <p>#{pr.number} por {pr.user.login}</p>
                <p>Creado: {new Date(pr.created_at).toLocaleDateString()}</p>
                <p>Última actualización: {new Date(pr.updated_at).toLocaleDateString()}</p>
                <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                  Ver en GitHub
                </a>
              </PRItem>
            ))}
          </PRList>
        )}
      </main>
    </Container>
  );
};

export default App; 