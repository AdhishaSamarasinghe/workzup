const { execSync } = require('child_process');
const fs = require('fs');

try {
    const history = execSync('git log --all -p -S"Verification" --oneline', { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
    fs.writeFileSync('tmp_git_history_all_branches.txt', history);
    console.log('History written');
} catch (e) {
    console.error(e);
}
