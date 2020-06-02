import {setFailed} from '@actions/core';
import {exec} from '@actions/exec';

async function run() {
    try {
        await exec('git config user.name "Jenkins305"');
        await exec('git config user.email "joris+jenkins@label305.com"');

        await exec('touch new_file');
        const statusResult = await exec('git status');
        console.log(statusResult);

        await exec('git add -A');
        const commitResult = await exec('git commit -am "New file"');
        console.log(commitResult);

        const pushResult = await exec('git push');
        console.log(pushResult);

        await exec('git reset --hard HEAD^');
        const pushResult2 = await exec('git push --force-with-lease');
        console.log(pushResult2);
    } catch (e) {
        setFailed(e);
    }
}

run();
