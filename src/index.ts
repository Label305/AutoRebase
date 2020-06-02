import {setFailed} from '@actions/core';
import {exec} from '@actions/exec';

async function run() {
    try {
        await exec('git config user.name "Jenkins305"');
        await exec('git config user.email "joris+jenkins@label305.com"');

        await exec('git fetch');
        const rebaseResult = await exec('git rebase origin/master');
        console.log(rebaseResult);
    } catch (e) {
        console.log(await exec('git status'));
        console.log(await exec('git diff'));

        setFailed(e);
    }
}

run();
