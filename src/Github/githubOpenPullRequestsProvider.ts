import {GitHub} from '@actions/github';
import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../pullrequestinfo';
import {mapAsync} from '../utils';
import {GithubMergeableStateProvider} from './githubMergeableStateProvider';

export class GithubOpenPullRequestsProvider implements OpenPullRequestsProvider {
    private github: GitHub;
    private mergeableStateProvider: GithubMergeableStateProvider;

    constructor(github: GitHub, mergeableStateProvider: GithubMergeableStateProvider) {
        this.github = github;
        this.mergeableStateProvider = mergeableStateProvider;
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
        const mergeableState = await this.mergeableStateProvider.mergeableStateFor(
            ownerName,
            repoName,
            pullRequestNumber,
        );

        return {
            ownerName: ownerName,
            repoName: repoName,
            number: pullRequestNumber,
            mergeableState: mergeableState,
        };
    }
}
