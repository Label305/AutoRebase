import {GitHub} from '@actions/github';
import {PullRequestInfo} from '../pullrequestinfo';
import {debug} from '@actions/core';
import {Octokit} from '@octokit/rest';
import {filterAsync} from '../utils';
import {EligiblePullRequestsRetriever} from './eligiblePullRequestsRetriever';

export class GithubEligiblePullRequestsRetriever implements EligiblePullRequestsRetriever {
    private github: GitHub;

    constructor(github: GitHub) {
        this.github = github;
    }

    async findEligiblePullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        const {data: data} = await this.github.pulls.list({
            owner: ownerName,
            repo: repoName,
            state: 'open',
        });

        debug(`Found ${data.length} open pull requests.`);

        const filtered: Octokit.PullsListResponseItem[] = await filterAsync(data, (value) => {
            return this.isMergeable(ownerName, value.number, repoName);
        });

        debug(`${filtered.length} pull requests are mergeable and behind.`);

        return filtered.map((value) => {
            return {
                ownerName: ownerName,
                repoName: repoName,
                number: value.number,
                mergeableState: 'unknown',
            };
        });
    }

    private async isMergeable(owner: string, pullRequestNumber: number, repo: string): Promise<boolean> {
        const {data: pullRequest} = await this.github.pulls.get({
            owner,
            pull_number: pullRequestNumber,
            repo,
        });
        const {mergeable_state: mergeableState} = pullRequest;

        if (!this.isMergeableStateKnown(pullRequest)) {
            throw new Error('Mergeable state not known!');
        }

        return mergeableState == 'behind';
    }

    private isMergeableStateKnown({closed_at: closedAt, mergeable_state: mergeableState}: Octokit.PullsGetResponse) {
        return closedAt !== null || mergeableState !== 'unknown';
    }
}
