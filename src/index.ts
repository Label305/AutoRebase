import {rebaseAndPush} from './rebase_and_push';
import {exec} from '@actions/exec';
import {setFailed} from '@actions/core';

async function run() {
    try {
        await rebaseAndPush('origin/master');
    } catch (e) {
        await exec('git status');
        await exec('git diff');

        setFailed(e);
    }
}

run();
