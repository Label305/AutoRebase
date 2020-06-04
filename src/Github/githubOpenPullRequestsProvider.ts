import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../pullrequestinfo';
import {mapAsync} from '../utils';
import {GithubMergeableStateProvider} from './githubMergeableStateProvider';
import {ApiListPullRequest, ListPullRequestsService} from './Api/listPullRequestsService';

export class GithubOpenPullRequestsProvider implements OpenPullRequestsProvider {
    constructor(
        private listPullRequestsService: ListPullRequestsService,
        private mergeableStateProvider: GithubMergeableStateProvider,
    ) {}

    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        const pullRequests = await this.listPullRequestsService.listOpenPullRequests(ownerName, repoName);

        return await mapAsync(pullRequests, async (pullRequest) => {
            return this.pullRequestInfoFor(ownerName, repoName, pullRequest);
        });
    }

    private async pullRequestInfoFor(
        ownerName: string,
        repoName: string,
        pullRequest: ApiListPullRequest,
    ): Promise<PullRequestInfo> {
        const mergeableState = await this.mergeableStateProvider.mergeableStateFor(
            ownerName,
            repoName,
            pullRequest.number,
        );

        return {
            ownerName: ownerName,
            repoName: repoName,
            number: pullRequest.number,
            mergeableState: mergeableState,
            labels: pullRequest.labels,
        };
    }
}
