export interface ElectronAPI {
  getGithubToken: () => Promise<string>;
  setGithubToken: (token: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
} 