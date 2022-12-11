import {GithubPullRequestInfoProvider} from '../githubPullRequestInfoProvider';
import {ApiGetPullRequest, ApiGetPullRequestReview, GetPullRequestService} from '../Api/getPullRequestService';
import each from 'jest-each';

class TestGetPullRequestService implements GetPullRequestService {
    results: ApiGetPullRequest[] = [];
    reviews: ApiGetPullRequestReview[] = [];

    async getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiGetPullRequest> {
        return this.results.shift()!;
    }

    async getPullRequestReviews(
        ownerName: string,
        repoName: string,
        pullRequestNumber: number,
    ): Promise<ApiGetPullRequestReview> {
        return this.reviews.shift()!;
    }
}

const getPullRequestService = new TestGetPullRequestService();
const provider = new GithubPullRequestInfoProvider(getPullRequestService);

describe('The pull request info is propagated', () => {
    each([['behind'], ['blocked'], ['clean'], ['dirty'], ['unstable']]).it(
        "when the mergeableState is '%s'",
        async (mergeableState) => {
            /* Given */
            getPullRequestService.results.push({
                draft: false,
                rebaseable: true,
                mergeableState: mergeableState,
                labels: [],
            });
            getPullRequestService.reviews.push({
                approved: true,
            });

            /* When */
            const result = await provider.pullRequestInfoFor('owner', 'repo', 3);

            /* Then */
            expect(result.mergeableState).toBe(mergeableState);
        },
    );

    it('if the draft status is true', async () => {
        /* Given */
        getPullRequestService.results.push({
            draft: true,
            rebaseable: true,
            mergeableState: 'unknown',
            labels: [],
        });
        getPullRequestService.reviews.push({
            approved: true,
        });

        /* When */
        const result = await provider.pullRequestInfoFor('owner', 'repo', 3);

        /* Then */
        expect(result.mergeableState).toBe('unknown');
    });

    it('if the approved status is false', async () => {
        /* Given */
        getPullRequestService.results.push({
            draft: true,
            rebaseable: true,
            mergeableState: 'unknown',
            labels: [],
        });
        getPullRequestService.reviews.push({
            approved: false,
        });

        /* When */
        const result = await provider.pullRequestInfoFor('owner', 'repo', 3);

        /* Then */
        expect(result.mergeableState).toBe('unknown');
    });
});

describe('The pull request info is retried', () => {
    each([['unknown'], ['invalid']]).it("when the mergeableState is '%s'", async (mergeableState) => {
        /* Given */
        getPullRequestService.results.push({
            draft: false,
            rebaseable: true,
            mergeableState: mergeableState,
            labels: [],
        });
        getPullRequestService.reviews.push({
            approved: true,
        });

        getPullRequestService.results.push({
            draft: false,
            rebaseable: true,
            mergeableState: 'behind',
            labels: [],
        });
        getPullRequestService.reviews.push({
            approved: true,
        });

        /* When */
        const result = await provider.pullRequestInfoFor('owner', 'repo', 3);

        /* Then */
        expect(result.mergeableState).toBe('behind');
    });

    it('a maximum of 10 times, then the original result is propagated', async () => {
        /* Given */
        for (let i = 0; i < 10; i++) {
            getPullRequestService.results.push({
                draft: false,
                rebaseable: true,
                mergeableState: 'unknown',
                labels: [],
            });
            getPullRequestService.reviews.push({
                approved: true,
            });
        }

        /* When */
        const result = await provider.pullRequestInfoFor('owner', 'repo', 3);

        /* Then */
        expect(result.mergeableState).toBe('unknown');
    });
});
