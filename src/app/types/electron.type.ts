declare global {
  interface Window {
    electron: {
      getGithubToken: () => Promise<string>;
      setGithubToken: (token: string) => Promise<boolean>;
      openExternal?: (url: string) => Promise<void>;
    }
  }
}

export {} 