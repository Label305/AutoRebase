import {GithubMergeableStateProvider} from '../githubMergeableStateProvider';
import {ApiGetPullRequest, GetPullRequestService} from '../Api/getPullRequestService';
import each from 'jest-each';

class TestGetPullRequestService implements GetPullRequestService {
    results: ApiGetPullRequest[] = [];

    async getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiGetPullRequest> {
        return this.results.shift()!;
    }
}

const getPullRequestService = new TestGetPullRequestService();
const provider = new GithubMergeableStateProvider(getPullRequestService);

describe('The mergeableState is propagated', () => {
    each([['behind'], ['blocked'], ['clean'], ['dirty'], ['unstable']]).it(
        "when the mergeableState is '%s'",
        async (mergeableState) => {
            /* Given */
            getPullRequestService.results.push({
                mergeableState: mergeableState,
            });

            /* When */
            const result = await provider.mergeableStateFor('owner', 'repo', 3);

            /* Then */
            expect(result).toBe(mergeableState);
        },
    );
});

describe('The mergeableState is retried', () => {
    each([['unknown'], ['invalid']]).it("when the mergeableState is '%s'", async (mergeableState) => {
        /* Given */
        getPullRequestService.results.push({
            mergeableState: mergeableState,
        });

        getPullRequestService.results.push({
            mergeableState: 'behind',
        });

        /* When */
        const result = await provider.mergeableStateFor('owner', 'repo', 3);

        /* Then */
        expect(result).toBe('behind');
    });
});
