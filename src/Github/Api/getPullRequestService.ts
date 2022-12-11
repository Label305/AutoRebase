import {GitHub} from '@actions/github';
import {MergeableState} from '../../pullrequestinfo';

export interface GetPullRequestService {
    getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiGetPullRequest>;
    getPullRequestReviews(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<ApiGetPullRequestReview>;
}

export interface ApiGetPullRequest {
    draft: boolean;
    rebaseable: boolean;
    mergeableState: MergeableState;
    labels: string[];
}
export interface ApiGetPullRequestReview {
    approved: boolean;
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
            draft: result.data.draft,
            rebaseable: result.data.rebaseable,
            mergeableState: result.data.mergeable_state as MergeableState,
            labels: result.data.labels.map((label) => label.name),
        };
    }

    public async getPullRequestReviews(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<ApiGetPullRequestReview> {
        const result = await this.github.pulls.listReviews({
            owner: ownerName,
            repo: repoName,
            pull_number: pullRequestNumber,
        });

        for (const review of result.data) {
            if (review.state === 'APPROVED') {
                return {
                    approved: true,
                };
            }
        }
        return {
            approved: false,
        };
    }
}
