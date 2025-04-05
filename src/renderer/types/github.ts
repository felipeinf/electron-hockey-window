export interface PullRequest {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  repoName: string;
  isOwn: boolean;
}

export function mapPullRequest(pr: any): PullRequest {
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    html_url: pr.html_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    repoName: pr.repoName || '',
    isOwn: pr.isOwn || false,
    user: {
      login: pr.user?.login || 'unknown',
    }
  };
} 