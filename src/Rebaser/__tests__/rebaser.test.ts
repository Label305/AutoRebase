import {Rebaser} from '../rebaser';
import {GithubRebase} from '../githubRebase';

class TestGithubRebase implements GithubRebase {
    result: Promise<string> = Promise.reject();

    rebasePullRequest(owner: string, pullRequestNumber: number, repo: string): Promise<string> {
        return this.result;
    }
}

const testGithubRebase = new TestGithubRebase();
const rebaser = new Rebaser(testGithubRebase);

test('An empty list of pull requests completes successfully', async () => {
    /* Given */
    let error = null;

    /* When */
    try {
        await rebaser.rebasePullRequests([]);
    } catch (e) {
        error = e;
    }

    /* Then */
    expect(error).toBeNull();
});

test('A single succeeding rebase completes successfully', async () => {
    /* Given */
    testGithubRebase.result = Promise.resolve('success');

    let error = null;

    /* When */
    try {
        await rebaser.rebasePullRequests([
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
        ]);
    } catch (e) {
        error = e;
    }

    /* Then */
    expect(error).toBeNull();
});

test('Failing rebase due to head base change completes successfully', async () => {
    /* Given */
    testGithubRebase.result = Promise.reject('Rebase aborted because the head branch changed');

    let error = null;

    /* When */
    try {
        await rebaser.rebasePullRequests([
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
        ]);
    } catch (e) {
        error = e;
    }

    /* Then */
    expect(error).toBeNull();
});

test('Failing rebase due unknown failure errors', async () => {
    /* Given */
    testGithubRebase.result = Promise.reject('Some unknown error');

    let error = null;

    /* When */
    try {
        await rebaser.rebasePullRequests([
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
        ]);
    } catch (e) {
        error = e;
    }

    /* Then */
    expect(error).not.toBeNull();
});
