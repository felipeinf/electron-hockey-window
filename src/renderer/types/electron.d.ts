export interface ElectronAPI {
  getGithubToken: () => Promise<string>;
  setGithubToken: (token: string) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
} 