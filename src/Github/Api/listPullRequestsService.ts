import {GitHub} from '@actions/github';
import {Octokit} from '@octokit/rest';

export interface ListPullRequestsService {
    listOpenPullRequests(ownerName: string, repoName: string): Promise<ApiListPullRequest[]>;
}

export interface ApiListPullRequest {
    number: number;
    labels: string[];
}

export class GithubListPullRequestsService implements ListPullRequestsService {
    constructor(private github: GitHub) {}

    async listOpenPullRequests(ownerName: string, repoName: string): Promise<ApiListPullRequest[]> {
        const options = this.github.pulls.list.endpoint.merge({
            owner: ownerName,
            repo: repoName,
            state: 'open',
        });

        const openPulls: ApiListPullRequest[] = [];
        for await (const response of this.github.paginate.iterator(options)) {
            const data = response.data as Octokit.PullsListResponse;
            openPulls.push(
                ...data.map((value) => {
                    return {
                        number: value.number,
                        labels: value.labels.map((label) => label.name),
                    };
                }),
            );
        }

        return openPulls;
    }
}
