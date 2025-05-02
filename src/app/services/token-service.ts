// Servicio para manejar el token de GitHub
export const GitHubTokenService = {
  // Clave para almacenar el token
  TOKEN_KEY: 'github-token',
  
  // Guardar el token (función asíncrona)
  saveToken: async (token: string): Promise<boolean> => {
    try {
      console.log('TokenService: Guardando token...');
      
      // Usar localStorage y sessionStorage para redundancia
      localStorage.setItem(GitHubTokenService.TOKEN_KEY, token);
      sessionStorage.setItem(GitHubTokenService.TOKEN_KEY, token);
      
      console.log('TokenService: Token guardado correctamente');
      return true;
    } catch (error) {
      console.error('TokenService: Error al guardar token:', error);
      try {
        // Intentar solo con sessionStorage como fallback
        sessionStorage.setItem(GitHubTokenService.TOKEN_KEY, token);
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  // Obtener el token guardado (función asíncrona)
  getToken: async (): Promise<string | null> => {
    try {
      // Intentar obtener el token del localStorage primero
      let token = localStorage.getItem(GitHubTokenService.TOKEN_KEY);
      
      // Si no está en localStorage, intentar de sessionStorage
      if (!token) {
        token = sessionStorage.getItem(GitHubTokenService.TOKEN_KEY);
      }
      
      return token;
    } catch (error) {
      console.error('TokenService: Error al obtener token:', error);
      try {
        // Intentar con sessionStorage como fallback
        return sessionStorage.getItem(GitHubTokenService.TOKEN_KEY);
      } catch (e) {
        return null;
      }
    }
  },

  // Eliminar el token (función asíncrona)
  removeToken: async (): Promise<boolean> => {
    try {
      console.log('TokenService: Eliminando token...');
      
      // Eliminar el token de ambos almacenamientos
      localStorage.removeItem(GitHubTokenService.TOKEN_KEY);
      sessionStorage.removeItem(GitHubTokenService.TOKEN_KEY);
      
      return true;
    } catch (error) {
      console.error('TokenService: Error al eliminar token:', error);
      try {
        // Intentar solo con sessionStorage como fallback
        sessionStorage.removeItem(GitHubTokenService.TOKEN_KEY);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};

export default GitHubTokenService; 