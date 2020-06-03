import {GitHub} from '@actions/github';
import {OpenPullRequestsProvider} from './testableEligiblePullRequestsRetriever';
import {MergeableState, PullRequestInfo} from '../pullrequestinfo';
import {debug} from '@actions/core';
import {mapAsync} from '../utils';

export class GithubOpenPullRequestsProvider implements OpenPullRequestsProvider {
    private github: GitHub;

    constructor(github: GitHub) {
        this.github = github;
    }

    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        const {data: pullRequests} = await this.github.pulls.list({
            owner: ownerName,
            repo: repoName,
            state: 'open',
        });

        return await mapAsync(pullRequests, async (value) => {
            return this.pullRequestInfoFor(ownerName, repoName, value.number);
        });
    }

    private async pullRequestInfoFor(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<PullRequestInfo> {
        const mergeableState = await this.mergeableStateFor(ownerName, repoName, pullRequestNumber);

        return {
            ownerName: ownerName,
            repoName: repoName,
            number: pullRequestNumber,
            mergeableState: mergeableState,
        };
    }

    private async mergeableStateFor(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<MergeableState> {
        const {
            data: {mergeable_state: mergeableState},
        } = await this.github.pulls.get({
            owner: ownerName,
            pull_number: pullRequestNumber,
            repo: repoName,
        });

        return mergeableState as MergeableState;
    }
}
