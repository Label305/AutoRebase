import * as execProcess from './exec_process';

async function run() {
    const statusResult = await execProcess.execute('git status');
    console.log(statusResult);
}

run();
