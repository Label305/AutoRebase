import * as execProcess from './exec_process';

async function run() {
    await execProcess.execute('touch new_file');
    const statusResult = await execProcess.execute('git status');
    console.log(statusResult);

    const commitResult = await execProcess.execute('git commit -am "New file"');
    console.log(commitResult);

    const pushResult = await execProcess.execute('git push');
    console.log(pushResult);
}

run();
