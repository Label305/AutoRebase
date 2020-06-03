import {
    OpenPullRequestsProvider,
    TestableEligiblePullRequestsRetriever,
} from '../../EligiblePullRequests/testableEligiblePullRequestsRetriever';
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
    let results = await retriever.findEligiblePullRequests('owner', 'repo');

    /* Then */
    expect(results).toStrictEqual([]);
});

describe('A pull request is eligible', () => {
    each([['behind']]).it("when the mergeableState is '%s'", async (mergeableState: MergeableState) => {
        /* Given */
        testOpenPullRequestsProvider.openPullRequestsValue = [
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                mergeableState: mergeableState,
            },
        ];

        /* When */
        let results = await retriever.findEligiblePullRequests('owner', 'repo');

        /* Then */
        expect(results).toStrictEqual([
            {
                ownerName: 'owner',
                repoName: 'repo',
                number: 3,
                mergeableState: mergeableState,
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
                },
            ];

            /* When */
            let results = await retriever.findEligiblePullRequests('owner', 'repo');

            /* Then */
            expect(results).toStrictEqual([]);
        },
    );
});
