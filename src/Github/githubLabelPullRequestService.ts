import {LabelPullRequestService} from '../NonRebaseablePullRequests/labeler';
import {GitHub} from '@actions/github';

export class GithubLabelPullRequestService implements LabelPullRequestService {
    constructor(private github: GitHub) {}

    async addLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void> {
        await this.github.issues.addLabels({
            owner: ownerName,
            repo: repoName,
            issue_number: pullRequestNumber,
            labels: [label],
        });
    }

    async removeLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void> {
        await this.github.issues.removeLabel({
            owner: ownerName,
            repo: repoName,
            issue_number: pullRequestNumber,
            name: label,
        });
    }
}
