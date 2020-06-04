import {PullRequestInfo} from '../pullrequestinfo';
import {EligiblePullRequestsRetriever} from './eligiblePullRequestsRetriever';
import {debug} from '@actions/core';
import {OPT_IN_LABEL} from '../labels';

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
            return TestableEligiblePullRequestsRetriever.isEligible(value);
        });

        debug(`${results.length} pull requests are eligible.`);

        return results;
    }

    private static isEligible(pullRequestInfo: PullRequestInfo): boolean {
        if (!pullRequestInfo.rebaseable) {
            debug(`PR #${pullRequestInfo.number} is not rebaseable.`);
            return false;
        }

        if (pullRequestInfo.mergeableState !== 'behind') {
            debug(`PR #${pullRequestInfo.number} is not 'behind', but: '${pullRequestInfo.mergeableState}'.`);
            return false;
        }

        if (!pullRequestInfo.labels.includes(OPT_IN_LABEL)) {
            debug(`PR #${pullRequestInfo.number} does not have the '${OPT_IN_LABEL}' label.`);
            return false;
        }

        return true;
    }
}
