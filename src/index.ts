import {setFailed} from '@actions/core';
import {exec} from '@actions/exec';

async function run() {
    try {
        await exec('git config user.name "Aimbot"');
        await exec('git config user.email "aimbot@305.nl"');

        await exec('touch new_file');
        const statusResult = await exec('git status');
        console.log(statusResult);

        const commitResult = await exec('git commit -am "New file"');
        console.log(commitResult);

        const pushResult = await exec('git push');
        console.log(pushResult);
    } catch (e) {
        setFailed(e);
    }
}

run();
