import { Endpoints } from "@octokit/types";

type PullRequestResponse = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"][0];

export interface PullRequest {
  id: number;
  title: string;
  number: number;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
}

export function mapPullRequest(pr: PullRequestResponse): PullRequest {
  return {
    id: pr.id,
    title: pr.title,
    number: pr.number,
    html_url: pr.html_url,
    user: {
      login: pr.user?.login || 'unknown'
    },
    created_at: pr.created_at,
    updated_at: pr.updated_at
  };
} 