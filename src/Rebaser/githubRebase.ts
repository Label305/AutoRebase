import {rebasePullRequest} from 'github-rebase/lib';
import {Octokit} from '@octokit/rest';

export interface GithubRebase {
    rebasePullRequest(owner: string, pullRequestNumber: number, repo: string): Promise<string>;
}

export class RealGithubRebase implements GithubRebase {
    private readonly octokit: Octokit;

    constructor(octokit: Octokit) {
        this.octokit = octokit;
    }

    public async rebasePullRequest(owner: string, pullRequestNumber: number, repo: string): Promise<string> {
        return rebasePullRequest({
            octokit: this.octokit,
            owner: owner,
            pullRequestNumber: pullRequestNumber,
            repo: repo,
        });
    }
}
