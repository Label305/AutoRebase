import {GitHub} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {info} from '@actions/core';
import {OPT_IN_LABEL} from '../../labels';

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
            // eslint-disable-next-line no-console
            console.log(data);
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
