import {PullRequestInfo} from './pullrequestinfo';
import {debug} from '@actions/core';
import {rebasePullRequest} from 'github-rebase/lib';
import {Octokit} from '@octokit/rest';
import {GitHub} from '@actions/github';

/**
 * Uses [github-rebase](https://github.com/tibdex/github-rebase)
 * to rebase pull requests.
 */
export class Rebaser {
    private github: GitHub;

    constructor(github: GitHub) {
        this.github = github;
    }

    public async rebasePullRequests(pullRequests: PullRequestInfo[]): Promise<void> {
        for (const pullRequest of pullRequests) {
            await this.rebase(pullRequest);
        }
    }

    private async rebase(pullRequest: PullRequestInfo) {
        debug(`Rebasing pull request ${JSON.stringify(pullRequest)}`);
        try {
            await rebasePullRequest({
                octokit: (this.github as unknown) as Octokit,
                owner: pullRequest.ownerName,
                pullRequestNumber: pullRequest.number,
                repo: pullRequest.repoName,
            });

            debug(`Rebase success for ${JSON.stringify(pullRequest)}`);
        } catch (e) {
            throw new Error(`Error for ${JSON.stringify(pullRequest)}: ${String(e)}`);
        }
    }
}
