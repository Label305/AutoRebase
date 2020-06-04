import {GitHub} from '@actions/github';
import {MergeableState} from '../../pullrequestinfo';

export interface GetPullRequestService {
    getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiGetPullRequest>;
}

export interface ApiGetPullRequest {
    rebaseable: boolean;
    mergeableState: MergeableState;
    labels: string[];
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
            rebaseable: result.data.rebaseable,
            mergeableState: result.data.mergeable_state as MergeableState,
            labels: result.data.labels.map((label) => label.name),
        };
    }
}
