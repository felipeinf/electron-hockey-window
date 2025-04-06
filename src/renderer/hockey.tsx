import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface PullRequest {
  id: number;
  title: string;
  repo: string;
  author: string;
  url: string;
}

// Importar el logo SVG
const HOCKEY_LOGO_SVG = `
<svg width="18" height="18" viewBox="0 0 288 288" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_1273_744)">
    <circle cx="97.314" cy="192.728" r="33.8762" transform="rotate(161.226 97.314 192.728)" fill="currentColor"/>
    <circle cx="172.397" cy="138.659" r="33.8762" transform="rotate(179.769 172.397 138.659)" fill="currentColor"/>
    <circle cx="105.92" cy="80.9523" r="43.5452" transform="rotate(-173.121 105.92 80.9523)" fill="currentColor"/>
    <circle cx="229.674" cy="188.104" r="31" transform="rotate(179.769 229.674 188.104)" fill="currentColor"/>
    <rect x="114.76" y="150.862" width="29.3092" height="72.3571" rx="14.6546" transform="rotate(-173.121 114.76 150.862)" fill="currentColor"/>
  </g>
</svg>
`;

// Componente SVG para el logo
interface SvgIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  svgContent: string;
  style?: React.CSSProperties;
}

const SvgIcon = ({ svgContent, ...props }: SvgIconProps) => (
  <span
    {...props}
    dangerouslySetInnerHTML={{ __html: svgContent }}
    style={{ ...props.style, display: 'inline-block' }}
  />
);

const AppContainer = styled.div`
  background: rgba(30, 30, 30, 0.9);
  color: white;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden;
`;

const TitleBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  background: rgba(20, 20, 20, 0.8);
  padding: 8px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: drag;
  z-index: 100;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  margin-top: 54px; /* Aumentar el margen superior para evitar superposición con TitleBar */
`;

const FooterBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: rgba(20, 20, 20, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  user-select: none;
  z-index: 10;
`;

const TokenForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
`;

const TokenInput = styled.input`
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

const ButtonsContainer = styled.div`
  display: flex;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #2980b9;
  }
`;

const PRCard = styled.div`
  background: rgba(40, 40, 40, 0.5);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  
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

const StatusMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: #aaa;
`;

const NativeButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  outline: none;
  &:hover {
    opacity: 0.8;
  }
`;

const Hockey: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [showTokenForm, setShowTokenForm] = useState<boolean>(false);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Iniciando aplicación...');
  const [loading, setLoading] = useState<boolean>(true);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [commits, setCommits] = useState<Record<number, Commit[]>>({});
  const [appReady, setAppReady] = useState(false);
  const [appStage, setAppStage] = useState<'skeleton' | 'loading' | 'ready'>('skeleton');

  useEffect(() => {
    // Mostrar inmediatamente el esqueleto de la interfaz
    setAppStage('skeleton');
    
    // Iniciar carga de datos después de un breve retardo
    setTimeout(() => {
      setAppStage('loading');
      
      const isElectronAvailable = typeof window.electron !== 'undefined';
      setApiAvailable(isElectronAvailable);
      
      console.log('¿API de Electron disponible?', isElectronAvailable);
      
      if (isElectronAvailable) {
        setStatus('Cargando token...');
        loadToken();
      } else {
        setStatus('API de Electron no disponible.');
        setLoading(false);
        setAppStage('ready');
      }
      
      // Agregar script al documento para manejar el botón de configuración
      const script = document.createElement('script');
      script.innerHTML = `
        function configButtonClick() {
          console.log('Botón de configuración clicado');
          var event = new CustomEvent('mostrarFormulario');
          document.dispatchEvent(event);
        }
      `;
      document.body.appendChild(script);
      
      // Escuchar eventos personalizados
      document.addEventListener('mostrarFormulario', () => {
        console.log('Evento mostrarFormulario recibido');
        mostrarFormulario();
      });
      
      // Establecer que la aplicación está visible inmediatamente
      setAppReady(true);
      
    }, 10);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tokenSaved && token) {
        console.log('Ventana visible, actualizando PRs automáticamente');
        loadPullRequests(token);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, tokenSaved]);

  const loadToken = async () => {
    try {
      console.log('Intentando cargar token de Github...');
      
      const savedToken = await window.electron.getGithubToken();
      console.log('Token recibido, longitud:', savedToken?.length || 0);
      
      if (savedToken) {
        setToken(savedToken);
        // Ir directamente a la vista de PRs si hay un token guardado
        setShowTokenForm(false);
        setTokenSaved(true);
        setStatus('Token cargado correctamente, cargando PRs...');
        loadPullRequests(savedToken);
      } else {
        // Solo mostrar configuración si no hay token
        setShowTokenForm(true);
        setStatus('No hay token configurado. Por favor, configura tu token de Github.');
        setLoading(false);
      }
      
      // Marcar como completamente cargada
      setAppStage('ready');
      
    } catch (error) {
      console.error('Error al cargar token:', error);
      setStatus('Error al cargar token.');
      setShowTokenForm(true);
      setLoading(false);
      setAppStage('ready');
    }
  };

  const loadPullRequests = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    setStatus('Cargando pull requests...');
    console.log('Iniciando carga de PRs con token de longitud:', accessToken.length);
    
    try {
      console.log('Obteniendo información del usuario...');
      
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      console.log('Respuesta de usuario - Status:', userResponse.status);
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('Error en respuesta de usuario:', errorText);
        throw new Error(`Error al obtener información del usuario: ${userResponse.status} ${userResponse.statusText}`);
      }
      
      const userData = await userResponse.json();
      console.log('Información de usuario obtenida:', userData.login);
      
      console.log('Solicitando PRs a GitHub...');
      const queryUrl = `https://api.github.com/search/issues?q=is:open+is:pr+user:${userData.login}`;
      console.log('URL de consulta:', queryUrl);
      
      const prResponse = await fetch(queryUrl, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      console.log('Respuesta de PRs - Status:', prResponse.status);
      
      if (!prResponse.ok) {
        const errorText = await prResponse.text();
        console.error('Error en respuesta de PRs:', errorText);
        console.log('Intentando obtener PRs directamente desde la API de usuario...');
        
        try {
          const directPrUrl = `https://api.github.com/user/issues?filter=all&state=open`;
          const directResponse = await fetch(directPrUrl, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          console.log('Respuesta directa de PRs - Status:', directResponse.status);
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('Datos recibidos directamente:', JSON.stringify(directData, null, 2));
            
            const pullRequests = directData.filter((item: any) => item.pull_request);
            console.log('PRs encontrados (método directo):', pullRequests.length);
            
            if (pullRequests.length > 0) {
              const formattedPRs: PullRequest[] = pullRequests.map((item: any) => {
                let repoInfo = '';
                try {
                  repoInfo = item.repository_url ? item.repository_url.split('/repos/')[1] || '' : '';
                } catch (e) {
                  console.error('Error al extraer info del repo para item:', item.id, e);
                }
                
                return {
                  id: item.id,
                  title: item.title,
                  repo: repoInfo,
                  author: item.user?.login || 'Desconocido',
                  url: item.html_url
                };
              });
              
              console.log('PRs formateados (método directo):', formattedPRs);
              setPullRequests(formattedPRs);
              setStatus(formattedPRs.length > 0 
                ? `${formattedPRs.length} pull requests encontrados`
                : 'No se encontraron pull requests');
              return;
            }
          } else {
            console.error('Error en respuesta directa:', await directResponse.text());
          }
        } catch (directError) {
          console.error('Error al intentar método alternativo:', directError);
        }
        
        throw new Error(`Error en solicitud de PRs a GitHub: ${prResponse.status} ${prResponse.statusText}`);
      }
      
      const data = await prResponse.json();
      console.log('Datos recibidos de GitHub:', JSON.stringify(data, null, 2));
      console.log('Número de PRs encontrados:', data.items ? data.items.length : 0);
      
      if (data && data.items && Array.isArray(data.items)) {
        const formattedPRs: PullRequest[] = data.items.map((item: any) => {
          console.log('Procesando item:', item.id, item.title);
          
          let repoInfo = '';
          try {
            repoInfo = item.repository_url ? item.repository_url.split('/repos/')[1] || '' : '';
          } catch (e) {
            console.error('Error al extraer info del repo para item:', item.id, e);
          }
          
          return {
            id: item.id,
            title: item.title,
            repo: repoInfo,
            author: item.user?.login || 'Desconocido',
            url: item.html_url
          };
        });
        
        console.log('PRs formateados:', formattedPRs);
        setPullRequests(formattedPRs);
        setStatus(formattedPRs.length > 0 
          ? `${formattedPRs.length} pull requests encontrados`
          : 'No se encontraron pull requests');
      } else {
        console.log('No se encontraron PRs o el formato de respuesta es incorrecto');
        console.log('Estructura de datos recibida:', JSON.stringify(data));
        setPullRequests([]);
        setStatus('No se encontraron pull requests');
      }
    } catch (err: any) {
      console.error('Error al cargar los PRs:', err);
      let errorMsg = err.message || 'Error al cargar los pull requests';
      
      if (errorMsg.includes('422')) {
        errorMsg = 'Error en solicitud de PRs a GitHub: 422 - Revisa que tu token tenga los permisos necesarios (repo, read:user)';
        console.log('Se detectó error 422 - Posiblemente permisos insuficientes en el token');
      }
      
      setError(errorMsg);
      setStatus('Error al conectar con GitHub - Verifica tu token');
    } finally {
      console.log('Finalizando carga de PRs, estableciendo loading=false');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Intentando guardar token:', token ? 'Sí (longitud: ' + token.length + ')' : 'No');
    
    if (!token.trim()) {
      setStatus('El token no puede estar vacío');
      return;
    }
    
    try {
      if (apiAvailable && typeof window.electron?.setGithubToken === 'function') {
        setLoading(true);
        const result = await window.electron.setGithubToken(token);
        console.log('Resultado al guardar token:', result);
        
        if (result) {
          setShowTokenForm(false);
          setTokenSaved(true);
          setStatus('Token guardado correctamente');
          loadPullRequests(token);
        } else {
          setStatus('Error al guardar el token');
          setLoading(false);
        }
      } else {
        setStatus('No se puede guardar el token: API no disponible');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al guardar el token:', error);
      setStatus('Error al guardar el token. Por favor intente de nuevo.');
      setLoading(false);
    }
  };

  const handleSettingsClick = () => {
    console.log('Abriendo configuración...');
    setShowTokenForm(true);
  };
  
  const handleDeleteToken = async () => {
    try {
      if (apiAvailable && typeof window.electron?.setGithubToken === 'function') {
        setLoading(true);
        const result = await window.electron.setGithubToken('');
        
        if (result) {
          setToken('');
          setTokenSaved(false);
          setShowTokenForm(true);
          setStatus('Token eliminado correctamente');
          setPullRequests([]);
        } else {
          setStatus('Error al eliminar el token');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al eliminar el token:', error);
      setStatus('Error al eliminar el token');
      setLoading(false);
    }
  };
  
  const handlePRClick = async (url: string) => {
    try {
      if (apiAvailable && typeof window.electron?.openExternal === 'function') {
        await window.electron.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al abrir URL:', error);
      setStatus('Error al abrir el enlace');
    }
  };
  
  const handleGenerateTokenClick = async () => {
    try {
      const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=Hockey%20PR%20App';
      if (apiAvailable && typeof window.electron?.openExternal === 'function') {
        await window.electron.openExternal(tokenUrl);
      } else {
        window.open(tokenUrl, '_blank');
      }
    } catch (error) {
      console.error('Error al abrir URL para generar token:', error);
      setStatus('Error al abrir el enlace');
    }
  };
  
  // Función para mostrar formulario de token
  const mostrarFormulario = () => {
    console.log('Ejecutando función para mostrar formulario');
    setShowTokenForm(true);
  };

  return (
    <AppContainer style={{ 
      visibility: appReady ? 'visible' : 'hidden',
      background: '#000'
    }}>
      <TitleBar>
        <h1 style={{ 
          margin: 0, 
          fontSize: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px'
        }}>
          <SvgIcon 
            svgContent={HOCKEY_LOGO_SVG} 
            style={{ color: 'white', width: '18px', height: '18px' }}
          /> 
          Hockey PR
        </h1>
      </TitleBar>
      
      <ContentArea>
        <StatusMessage>{status}</StatusMessage>
        
        {appStage === 'ready' && (
          <>
            {showTokenForm ? (
              <TokenForm id="settings-form" onSubmit={handleSubmit}>
                <h2 style={{ margin: '0 0 8px 0' }}>Configuración</h2>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>
                  Ingresa tu token de acceso personal de GitHub con permisos para leer PRs.
                </p>
                <label>
                  Token de GitHub
                  <TokenInput
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
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
                      padding: '8px 16px'
                    }}
                  >
                    Guardar
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleGenerateTokenClick} 
                    style={{ 
                      background: '#3a3a3a', 
                      borderColor: '#444', 
                      marginLeft: '8px',
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                  >
                    Generar Token
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleDeleteToken} 
                    style={{ 
                      background: 'transparent',
                      color: '#ff6b6b',
                      borderColor: '#ff6b6b',
                      border: '1px solid',
                      marginLeft: '8px',
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                  >
                    Eliminar Token
                  </Button>
                </ButtonsContainer>
              </TokenForm>
            ) : (
              <>
                <h2>Pull Requests</h2>
                
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>Cargando pull requests...</div>
                  </div>
                ) : (
                  <>
                    {pullRequests.map(pr => (
                      <PRCard 
                        key={pr.id}
                        onClick={() => handlePRClick(pr.url)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h3>{pr.title}</h3>
                        <p>{pr.repo} • {pr.author}</p>
                      </PRCard>
                    ))}
                    
                    <Button 
                      onClick={() => loadPullRequests(token)}
                      style={{ 
                        marginTop: '12px', 
                        alignSelf: 'center',
                        background: '#2c3e50',
                        borderColor: '#34495e' 
                      }}
                    >
                      Actualizar PRs
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </ContentArea>
      
      <FooterBar>
        <button 
          onClick={() => mostrarFormulario()}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.2475 9.40789 21.3073 9.30769 21.3292 9.19646C21.351 9.08523 21.3337 8.96986 21.28 8.87L19.36 5.55C19.3032 5.44985 19.2129 5.37291 19.105 5.33268C18.9972 5.29245 18.8785 5.2915 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.3823 2.69553 14.3241 2.5912 14.2361 2.51597C14.148 2.44074 14.0359 2.39959 13.92 2.4H10.08C9.84003 2.4 9.65002 2.57 9.61002 2.81L9.25003 5.35C8.66003 5.59 8.12003 5.92 7.63003 6.29L5.24003 5.33C5.02003 5.25 4.77003 5.33 4.65003 5.55L2.74003 8.87C2.62003 9.08 2.66003 9.34 2.86003 9.48L4.89003 11.06C4.84003 11.36 4.80003 11.69 4.80003 12C4.80003 12.31 4.82003 12.64 4.87003 12.94L2.84003 14.52C2.75255 14.5921 2.69278 14.6923 2.6709 14.8035C2.64902 14.9148 2.66638 15.0301 2.72003 15.13L4.64003 18.45C4.76003 18.67 5.01003 18.74 5.23003 18.67L7.62003 17.71C8.12003 18.09 8.65003 18.41 9.24003 18.65L9.60003 21.19C9.65003 21.43 9.84003 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.40002 13.98 8.40002 12C8.40002 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="white"/>
          </svg>

        </button>
        <span>Made with ⚡ by Codefire</span>
      </FooterBar>
    </AppContainer>
  );
};

declare global {
  interface Window {
    electron: {
      getGithubToken: () => Promise<string>;
      setGithubToken: (token: string) => Promise<boolean>;
      openExternal?: (url: string) => Promise<void>;
    }
  }
}

export default Hockey; 