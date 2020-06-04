import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {info} from '@actions/core';
import {PullRequestInfo} from '../pullrequestinfo';

// Secondary port for Labeler
export interface LabelPullRequestService {
    addLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void>;

    removeLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void>;
}

export class Labeler {
    constructor(
        private openPullRequestsProvider: OpenPullRequestsProvider,
        private labelPullRequestService: LabelPullRequestService,
    ) {}

    async labelNonRebaseablePullRequests(ownerName: string, repoName: string): Promise<void> {
        const pullRequests = await this.openPullRequestsProvider.openPullRequests(ownerName, repoName);
        await this.addLabels(pullRequests, ownerName, repoName);
        await this.removeLabels(pullRequests, ownerName, repoName);
    }

    private async addLabels(pullRequests: PullRequestInfo[], ownerName: string, repoName: string) {
        const toBeLabeled = pullRequests.filter(
            (value) => !value.rebaseable && !value.labels.includes('nonrebaseable'),
        );

        await Promise.all(
            toBeLabeled.map((value) => {
                info(`Adding nonrebaseable label to PR #${value.number}.`);
                return this.labelPullRequestService.addLabel(ownerName, repoName, value.number, 'nonrebaseable');
            }),
        );
    }

    private async removeLabels(pullRequests: PullRequestInfo[], ownerName: string, repoName: string) {
        const toBeUnlabeled = pullRequests.filter(
            (value) => value.rebaseable && value.labels.includes('nonrebaseable'),
        );

        await Promise.all(
            toBeUnlabeled.map((value) => {
                info(`Removing nonrebaseable label from PR #${value.number}.`);
                return this.labelPullRequestService.removeLabel(ownerName, repoName, value.number, 'nonrebaseable');
            }),
        );
    }
}
