import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../pullrequestinfo';
import {mapAsync} from '../utils';
import {GithubPullRequestInfoProvider} from './githubPullRequestInfoProvider';
import {ApiListPullRequest, ListPullRequestsService} from './Api/listPullRequestsService';

export class GithubOpenPullRequestsProvider implements OpenPullRequestsProvider {
    constructor(
        private listPullRequestsService: ListPullRequestsService,
        private mergeableStateProvider: GithubPullRequestInfoProvider,
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
        apiListPullRequest: ApiListPullRequest,
    ): Promise<PullRequestInfo> {
        const pullRequest = await this.mergeableStateProvider.pullRequestInfoFor(
            ownerName,
            repoName,
            apiListPullRequest.number,
        );

        return {
            ownerName: ownerName,
            repoName: repoName,
            number: pullRequest.number,
            draft: pullRequest.draft,
            rebaseable: pullRequest.rebaseable,
            mergeableState: pullRequest.mergeableState,
            labels: pullRequest.labels,
        };
    }
}
