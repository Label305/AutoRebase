import * as childProcess from 'child_process';

export function execute(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (error: childProcess.ExecException | null, stdout, stderr) => {
            if (error != null) {
                reject(new Error(error.message));
                return;
            }

            if (stderr.length > 0) {
                reject(new Error(stderr));
                return;
            }

            resolve(stdout);
        });
    });
}
