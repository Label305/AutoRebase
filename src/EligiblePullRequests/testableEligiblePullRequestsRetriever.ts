import {PullRequestInfo} from '../pullrequestinfo';
import {EligiblePullRequestsRetriever} from './eligiblePullRequestsRetriever';
import {debug} from '@actions/core';

// Secondary port for [[TestableEligiblePullRequestsRetriever]]
export interface OpenPullRequestsProvider {
    openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]>;
}

export class TestableEligiblePullRequestsRetriever implements EligiblePullRequestsRetriever {
    private openPullRequestsProvider: OpenPullRequestsProvider;

    constructor(openPullRequestsProvider: OpenPullRequestsProvider) {
        this.openPullRequestsProvider = openPullRequestsProvider;
    }

    async findEligiblePullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        const pullRequests = await this.openPullRequestsProvider.openPullRequests(ownerName, repoName);

        debug(`Found ${pullRequests.length} open pull requests.`);

        const results = pullRequests.filter((value) => {
            return value.mergeableState == 'behind';
        });

        debug(`${results.length} pull requests are behind.`);

        return results;
    }
}
