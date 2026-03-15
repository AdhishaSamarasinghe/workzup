import subprocess
import os

def rewrite_commits():
    # Use absolute path for the msg filter
    script_path = os.path.abspath("msg_filter.py")
    
    msg_filter_script = r"""import sys
import re
msg = sys.stdin.read()
new_msg = re.sub(r'(?i)commit\s+\d+\s*-\s*', '', msg)
sys.stdout.write(new_msg)
"""
    with open(script_path, "w") as f:
        f.write(msg_filter_script)

    env = os.environ.copy()
    filter_cmd = [
        "git", "filter-branch", "-f", "--msg-filter",
        f'python "{script_path}"', "6b0a376..HEAD"
    ]
    
    result = subprocess.run(filter_cmd, env=env, capture_output=True, text=True)
    print(result.stdout)
    print(result.stderr)
    
    if os.path.exists(script_path):
        os.remove(script_path)

if __name__ == "__main__":
    rewrite_commits()
