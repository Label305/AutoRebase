import {Octokit} from '@octokit/rest';
import {rebasePullRequest} from '@seung-o/github-rebase';

export interface GithubRebase {
    rebasePullRequest(owner: string, pullRequestNumber: number, repo: string, base?: string): Promise<string>;
}

export class RealGithubRebase implements GithubRebase {
    private readonly octokit: Octokit;

    constructor(octokit: Octokit) {
        this.octokit = octokit;
    }

    public async rebasePullRequest(
        owner: string,
        pullRequestNumber: number,
        repo: string,
        baseBranch?: string,
    ): Promise<string> {
        return rebasePullRequest({
            octokit: this.octokit,
            owner: owner,
            pullRequestNumber: pullRequestNumber,
            repo: repo,
            base: baseBranch,
        });
    }
}
