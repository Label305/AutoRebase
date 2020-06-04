import {GitHub} from '@actions/github';

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
        const {data: data} = await this.github.pulls.list({
            owner: ownerName,
            repo: repoName,
            state: 'open',
        });

        return data.map((value) => {
            return {
                number: value.number,
                labels: value.labels.map((label) => label.name),
            };
        });
    }
}
