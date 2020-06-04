import {Labeler, LabelPullRequestService} from '../labeler';
import {OpenPullRequestsProvider} from '../../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../../pullrequestinfo';

const pullRequests: Map<number, PullRequestInfo> = new Map();

class TestOpenPullRequestsProvider implements OpenPullRequestsProvider {
    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        return Array.from(pullRequests.values());
    }
}

class TestLabelPullRequestService implements LabelPullRequestService {
    async addLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void> {
        const pullRequest = pullRequests.get(pullRequestNumber)!;
        pullRequest.labels.push(label);
    }

    async removeLabel(ownerName: string, repoName: string, pullRequestNumber: number, label: string): Promise<void> {
        const pullRequest = pullRequests.get(pullRequestNumber)!;
        pullRequest.labels = pullRequest.labels.filter((value) => value !== label);
    }
}

const labelPullRequestService = new TestLabelPullRequestService();
const labeler = new Labeler(new TestOpenPullRequestsProvider(), labelPullRequestService);

describe('A pull request gets labeled when', () => {
    it('it is not rebaseable', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [],
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toStrictEqual(['nonrebaseable']);
    });
});

describe('A pull request does not get labeled when', () => {
    it('it is rebaseable', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [],
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toStrictEqual([]);
    });

    it('it is not rebaseable but it already has the label', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: false,
            mergeableState: 'behind',
            labels: ['nonrebaseable'],
        });

        const addLabelSpy = spyOn(labelPullRequestService, 'addLabel');

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(addLabelSpy).not.toHaveBeenCalled();
    });
});

describe('The label gets removed from a pull request when', () => {
    it('it is rebaseable', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: true,
            mergeableState: 'behind',
            labels: ['nonrebaseable'],
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toStrictEqual([]);
    });
});

describe('The label does not get removed from a pull request when', () => {
    it('it is not rebaseable', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: false,
            mergeableState: 'behind',
            labels: ['nonrebaseable'],
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toStrictEqual(['nonrebaseable']);
    });

    it('it does not exist', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [],
        });

        const removeLabelSpy = spyOn(labelPullRequestService, 'removeLabel');

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(removeLabelSpy).not.toHaveBeenCalled();
    });
});
