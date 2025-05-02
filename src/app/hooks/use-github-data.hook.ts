import { useState, useEffect, useCallback } from 'react';
import { PullRequest, Commit } from '../types';
import GitHubTokenService from '../services/token-service';
import { Octokit } from '@octokit/rest';

interface UseGitHubDataReturn {
  token: string;
  setToken: (token: string) => void;
  status: string;
  apiAvailable: boolean;
  loading: boolean;
  pullRequests: PullRequest[];
  tokenSaved: boolean;
  error: string | null;
  showTokenForm: boolean;
  setShowTokenForm: (show: boolean) => void;
  currentUser: string;
  selectedPR: number | null;
  commits: Record<number, Commit[]>;
  appReady: boolean;
  appStage: 'skeleton' | 'loading' | 'ready';
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleSettingsClick: () => void;
  handleDeleteToken: () => Promise<void>;
  handlePRClick: (url: string) => Promise<void>;
  handleGenerateTokenClick: () => Promise<void>;
  mostrarFormulario: () => void;
  loadPullRequests: (accessToken: string) => Promise<void>;
}

// Variable global para verificar si la API de Electron está disponible
const isElectronApiAvailable = typeof window !== 'undefined' && !!window.electron;

const useGitHubData = (): UseGitHubDataReturn => {
  const [token, setToken] = useState<string>('');
  const [showTokenForm, setShowTokenForm] = useState<boolean>(true);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Cargando...');
  const [loading, setLoading] = useState<boolean>(true);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
      
      const isElectronAvailable = typeof window !== 'undefined' && !!window.electron;
      setApiAvailable(isElectronAvailable);
      
      console.log('¿API de Electron disponible?', isElectronAvailable);
      console.log('Iniciando carga de datos, incluso sin Electron');
      
      // Siempre intentamos cargar el token, incluso sin Electron
      setStatus('Cargando token...');
      loadToken();
      
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

  const loadToken = useCallback(async () => {
    try {
      console.log('Intentando cargar token de Github...');
      
      // Primero intentar desde localStorage usando el servicio
      let savedToken = await GitHubTokenService.getToken();
      console.log('Token desde localStorage:', savedToken ? '***' : 'null');
      
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
  }, []);

  const loadPullRequests = useCallback(async (accessToken: string) => {
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
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Por favor, ingresa un token válido');
      return;
    }
    
    setStatus('Guardando token...');
    setLoading(true);
    setError(null);
    
    try {
      // Guardar el token usando el servicio que usa localStorage
      const success = await GitHubTokenService.saveToken(token);
      
      if (success) {
        setTokenSaved(true);
        setShowTokenForm(false);
        setStatus('Token guardado, cargando pull requests...');
        loadPullRequests(token);
      } else {
        setError('No se pudo guardar el token');
        setStatus('Error al guardar token');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al guardar token:', error);
      setError('Ocurrió un error al guardar el token');
      setStatus('Error al guardar token');
      setLoading(false);
    }
  }, [token, loadPullRequests]);

  const handleSettingsClick = () => {
    console.log('Alternando configuración...');
    setShowTokenForm(!showTokenForm);
  };
  
  const handleDeleteToken = useCallback(async () => {
    setStatus('Eliminando token...');
    setLoading(true);
    
    try {
      // Eliminar el token usando el servicio que usa localStorage
      const success = await GitHubTokenService.removeToken();
      
      if (success) {
        setToken('');
        setTokenSaved(false);
        setShowTokenForm(true);
        setPullRequests([]);
        setStatus('Token eliminado correctamente');
      } else {
        setError('No se pudo eliminar el token');
        setStatus('Error al eliminar token');
      }
    } catch (error) {
      console.error('Error al eliminar token:', error);
      setError('Ocurrió un error al eliminar el token');
      setStatus('Error al eliminar token');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handlePRClick = useCallback(async (url: string) => {
    try {
      await window.electron.openExternal(url);
    } catch (err) {
      console.error('Error abriendo PR:', err);
      setError('Error abriendo PR');
    }
  }, []);
  
  const handleGenerateTokenClick = useCallback(async () => {
    try {
      await window.electron.openExternal('https://github.com/settings/tokens');
    } catch (err) {
      console.error('Error abriendo página de tokens:', err);
      setError('Error abriendo página de tokens');
    }
  }, []);
  
  // Función para mostrar formulario de token
  const mostrarFormulario = () => {
    console.log('Ejecutando función para mostrar formulario');
    handleSettingsClick();
  };

  return {
    token,
    setToken,
    status,
    apiAvailable,
    loading,
    pullRequests,
    tokenSaved,
    error,
    showTokenForm,
    setShowTokenForm,
    currentUser,
    selectedPR,
    commits,
    appReady,
    appStage,
    handleSubmit,
    handleSettingsClick,
    handleDeleteToken,
    handlePRClick,
    handleGenerateTokenClick,
    mostrarFormulario,
    loadPullRequests
  };
};

export default useGitHubData; 