import {OpenPullRequestsProvider} from '../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {info} from '@actions/core';
import {PullRequestInfo} from '../pullrequestinfo';
import {NON_REBASEABLE_LABEL} from '../labels';

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
            (value) => !value.rebaseable && !value.labels.includes(NON_REBASEABLE_LABEL),
        );

        await Promise.all(
            toBeLabeled.map((value) => {
                info(`Adding '${NON_REBASEABLE_LABEL}' label to PR #${value.number}.`);
                return this.labelPullRequestService.addLabel(ownerName, repoName, value.number, NON_REBASEABLE_LABEL);
            }),
        );
    }

    private async removeLabels(pullRequests: PullRequestInfo[], ownerName: string, repoName: string) {
        const toBeUnlabeled = pullRequests.filter(
            (value) => value.rebaseable && value.labels.includes(NON_REBASEABLE_LABEL),
        );

        await Promise.all(
            toBeUnlabeled.map((value) => {
                info(`Removing '${NON_REBASEABLE_LABEL}' label from PR #${value.number}.`);
                return this.labelPullRequestService.removeLabel(
                    ownerName,
                    repoName,
                    value.number,
                    NON_REBASEABLE_LABEL,
                );
            }),
        );
    }
}
