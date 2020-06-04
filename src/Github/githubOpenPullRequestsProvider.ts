import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../pullrequestinfo';
import {mapAsync} from '../utils';
import {GithubMergeableStateProvider} from './githubMergeableStateProvider';
import {ListPullRequestsService} from './Api/listPullRequestsService';

export class GithubOpenPullRequestsProvider implements OpenPullRequestsProvider {
    constructor(
        private listPullRequestsService: ListPullRequestsService,
        private mergeableStateProvider: GithubMergeableStateProvider,
    ) {}

    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        const pullRequests = await this.listPullRequestsService.listOpenPullRequests(ownerName, repoName);

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
