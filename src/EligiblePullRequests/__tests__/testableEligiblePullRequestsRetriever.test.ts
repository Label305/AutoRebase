import {
    OpenPullRequestsProvider,
    TestableEligiblePullRequestsRetriever,
} from '../testableEligiblePullRequestsRetriever';
import {MergeableState, PullRequestInfo} from '../../pullrequestinfo';
import each from 'jest-each';
import {OPT_IN_LABEL} from '../../labels';

class TestOpenPullRequestsProvider implements OpenPullRequestsProvider {
    openPullRequestsValue: PullRequestInfo[] = [];

    async openPullRequests(ownerName: string, repoName: string): Promise<PullRequestInfo[]> {
        return this.openPullRequestsValue;
    }
}

const testOpenPullRequestsProvider = new TestOpenPullRequestsProvider();
const retriever = new TestableEligiblePullRequestsRetriever(testOpenPullRequestsProvider);

test('Without open pull requests there are no eligible pull requests', async () => {
    /* When */
    const results = await retriever.findEligiblePullRequests('owner', 'repo');

    /* Then */
    expect(results).toStrictEqual([]);
});

describe('A pull request is eligible', () => {
    it(`when it is rebaseable, the mergeableState is 'behind' and it has the label '${OPT_IN_LABEL}'`, async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: false,
                rebaseable: true,
                mergeableState: 'behind',
                labels: [OPT_IN_LABEL],
                approved: true,
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: false,
                rebaseable: true,
                mergeableState: 'behind',
                labels: [OPT_IN_LABEL],
                approved: true,
            },
        ]);
    });
});

describe('A pull request is not eligible', () => {
    it("when it isn't rebaseable", async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: false,
                rebaseable: false,
                mergeableState: 'behind',
                labels: [OPT_IN_LABEL],
                approved: true,
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([]);
    });

    each([['blocked'], ['clean'], ['dirty'], ['unknown'], ['unstable']]).it(
        "when the mergeableState is '%s'",
        async (mergeableState: MergeableState) => {
            /* Given */
            testOpenPullRequestsProvider.openPullRequestsValue = [
                {
                    ownerName: 'owner',
                    repoName: 'repo',
                    number: 3,
                    draft: false,
                    rebaseable: true,
                    mergeableState: mergeableState,
                    labels: [OPT_IN_LABEL],
                    approved: true,
                },
            ];

            /* When */
            const results = await retriever.findEligiblePullRequests('owner', 'repo');

            /* Then */
            expect(results).toStrictEqual([]);
        },
    );

    it(`when it doesn't have the '${OPT_IN_LABEL}' label`, async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: false,
                rebaseable: true,
                mergeableState: 'behind',
                labels: [],
                approved: true,
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([]);
    });

    it(`when it is a draft pull request`, async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: true,
                rebaseable: true,
                mergeableState: 'behind',
                labels: [OPT_IN_LABEL],
                approved: true,
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([]);
    });

    it(`when it is a not approved`, async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                draft: true,
                rebaseable: true,
                mergeableState: 'behind',
                labels: [OPT_IN_LABEL],
                approved: false,
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([]);
    });
});
