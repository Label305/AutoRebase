import * as execProcess from './exec_process';

async function run() {
    await execProcess.execute('touch new_file');
    const statusResult = await execProcess.execute('git status');
    console.log(statusResult);
}

run();
