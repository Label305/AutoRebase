import {
    OpenPullRequestsProvider,
    TestableEligiblePullRequestsRetriever,
} from '../testableEligiblePullRequestsRetriever';
import {MergeableState, PullRequestInfo} from '../../pullrequestinfo';
import each from 'jest-each';

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
    it("when the mergeableState is 'behind' and it has the label 'opt-in:autorebase'", async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                mergeableState: 'behind',
                labels: ['opt-in:autorebase'],
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
                mergeableState: 'behind',
                labels: ['opt-in:autorebase'],
            },
        ]);
    });
});

describe('A pull request is not eligible', () => {
    each([['blocked'], ['clean'], ['dirty'], ['unknown'], ['unstable']]).it(
        "when the mergeableState is '%s'",
        async (mergeableState: MergeableState) => {
            /* Given */
            testOpenPullRequestsProvider.openPullRequestsValue = [
                {
                    ownerName: 'owner',
                    repoName: 'repo',
                    number: 3,
                    mergeableState: mergeableState,
                    labels: ['opt-in:autorebase'],
                },
            ];

            /* When */
            const results = await retriever.findEligiblePullRequests('owner', 'repo');

            /* Then */
            expect(results).toStrictEqual([]);
        },
    );

    it("when it doesn't have the 'opt-in:autorebase' label", async () => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                mergeableState: 'behind',
                labels: [],
            },
        ];

        /* When */
        const results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([]);
    });
});
