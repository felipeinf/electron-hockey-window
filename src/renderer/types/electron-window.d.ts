export {};

declare global {
  interface Window {
    electron: {
      getGithubToken: () => Promise<string>;
      setGithubToken: (token: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
    }
  }
} 