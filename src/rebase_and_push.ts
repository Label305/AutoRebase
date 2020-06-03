import {exec} from '@actions/exec';

export async function rebaseAndPush(target: string) {
    await exec('git config user.name "Jenkins305"');
    await exec('git config user.email "joris+jenkins@label305.com"');

    await exec('git status');

    await exec('git fetch');
    await exec(`git rebase ${target}`);
    await exec('git push --force-with-lease');
}
