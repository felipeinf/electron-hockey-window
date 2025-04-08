export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface PullRequest {
  id: number;
  title: string;
  repo: string;
  author: string;
  url: string;
} 