import {GitHub} from '@actions/github';
import {MergeableState} from '../../pullrequestinfo';

export interface GetPullRequestService {
    getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiGetPullRequest>;
}

export interface ApiGetPullRequest {
    mergeableState: MergeableState | undefined;
}

export class GithubGetPullRequestService implements GetPullRequestService {
    constructor(private github: GitHub) {}

    public async getPullRequest(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<ApiGetPullRequest> {
        const result = await this.github.pulls.get({
            owner: ownerName,
            repo: repoName,
            pull_number: pullRequestNumber,
        });

        return {
            mergeableState: result.data.mergeable_state as MergeableState,
        };
    }
}
