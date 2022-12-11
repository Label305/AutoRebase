import {Labeler, LabelPullRequestService} from '../labeler';
import {OpenPullRequestsProvider} from '../../EligiblePullRequests/testableEligiblePullRequestsRetriever';
import {PullRequestInfo} from '../../pullrequestinfo';
import {NON_REBASEABLE_LABEL, OPT_IN_LABEL} from '../../labels';

const pullRequests: Map<number, PullRequestInfo> = new Map();

class TestOpenPullRequestsProvider implements OpenPullRequestsProvider {
    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        return Array.from(pullRequests.values());
    }
}

class TestLabelPullRequestService implements LabelPullRequestService {
    async listLabels(ownerName: string, repoName: string): Promise<string[]> {
        return [];
    }

    async createLabel(
        ownerName: string,
        repoName: string,
        label: string,
        color: string,
        description: string,
    ): Promise<void> {}

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
            draft: false,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [OPT_IN_LABEL],
            approved: true,
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toContain(NON_REBASEABLE_LABEL);
    });
});

describe('A pull request does not get labeled when', () => {
    it('it is rebaseable', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            draft: false,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [],
            approved: true,
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
            draft: false,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [NON_REBASEABLE_LABEL],
            approved: true,
        });

        const addLabelSpy = spyOn(labelPullRequestService, 'addLabel');

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(addLabelSpy).not.toHaveBeenCalled();
    });

    it('it is not approved yet but it already has the label', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            draft: false,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [NON_REBASEABLE_LABEL],
            approved: false,
        });

        const addLabelSpy = spyOn(labelPullRequestService, 'addLabel');

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(addLabelSpy).not.toHaveBeenCalled();
    });

    it(`it is not rebaseable but it does not have the label '${OPT_IN_LABEL}'`, async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            draft: false,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [],
            approved: true,
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
            draft: false,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [NON_REBASEABLE_LABEL],
            approved: true,
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
            draft: false,
            rebaseable: false,
            mergeableState: 'behind',
            labels: [NON_REBASEABLE_LABEL],
            approved: true,
        });

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(pullRequests.get(3)!.labels).toStrictEqual([NON_REBASEABLE_LABEL]);
    });

    it('it does not exist', async () => {
        /* Given */
        pullRequests.set(3, {
            ownerName: 'owner',
            repoName: 'repo',
            number: 3,
            draft: false,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [],
            approved: false,
        });

        const removeLabelSpy = spyOn(labelPullRequestService, 'removeLabel');

        /* When */
        await labeler.labelNonRebaseablePullRequests('owner', 'repo');

        /* Then */
        expect(removeLabelSpy).not.toHaveBeenCalled();
    });
});
