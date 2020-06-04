import {LabelPullRequestService} from '../NonRebaseablePullRequests/labeler';
import {GitHub} from '@actions/github';

export class GithubLabelPullRequestService implements LabelPullRequestService {
    constructor(private github: GitHub) {}

    async listLabels(ownerName: string, repoName: string): Promise<string[]> {
        const {data: labels} = await this.github.issues.listLabelsForRepo({
            owner: ownerName,
            repo: repoName,
        });

        return labels.map((value) => value.name);
    }

    async createLabel(ownerName: string, repoName: string, label: string, color: string): Promise<void> {
        await this.github.issues.createLabel({
            owner: ownerName,
            repo: repoName,
            name: label,
            color: color,
        });
    }

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
