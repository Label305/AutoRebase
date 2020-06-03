import {GithubMergeableStateProvider} from '../../Github/githubMergeableStateProvider';
import {GetPullRequestService} from '../../Github/Api/getPullRequestService';
import {ApiPullRequest} from '../../Github/Api/apiPullRequest';
import each from 'jest-each';

class TestGetPullRequestService implements GetPullRequestService {
    results: ApiPullRequest[] = [];

    async getPullRequest(ownerName: string, repoName: string, pullRequestNumber: number): Promise<ApiPullRequest> {
        return this.results.shift()!;
    }
}

const getPullRequestService = new TestGetPullRequestService();
const provider = new GithubMergeableStateProvider(getPullRequestService);

describe('The mergeableState is propagated', () => {
    each([['behind'], ['blocked'], ['clean'], ['dirty'], ['unstable']]).it(
        "when the mergeable_state is '%s'",
        async (mergeable_state) => {
            /* Given */
            getPullRequestService.results.push({
                mergeable_state: mergeable_state,
            });

            /* When */
            const result = await provider.mergeableStateFor('owner', 'repo', 3);

            /* Then */
            expect(result).toBe(mergeable_state);
        },
    );
});

describe('The mergeableState is retried', () => {
    each([['unknown'], ['invalid']]).it("when the mergeable_state is '%s'", async (mergeable_state) => {
        /* Given */
        getPullRequestService.results.push({
            mergeable_state: mergeable_state,
        });

        getPullRequestService.results.push({
            mergeable_state: 'behind',
        });

        /* When */
        const result = await provider.mergeableStateFor('owner', 'repo', 3);

        /* Then */
        expect(result).toBe('behind');
    });
});
