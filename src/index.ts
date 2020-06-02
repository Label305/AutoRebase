import {setFailed} from '@actions/core';
import {exec} from '@actions/exec';

async function run() {
    try {
        await exec('git config user.name "Jenkins305"');
        await exec('git config user.email "joris+jenkins@label305.com"');

        await exec('git status');

        await exec('git fetch');
        await exec('git rebase origin/master');
    } catch (e) {
        await exec('git status');
        await exec('git diff');

        setFailed(e);
    }
}

run();
