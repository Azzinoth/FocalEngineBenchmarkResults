"""Rebuilds index.json from every runs/<engine commit sha>/<machine>/result.json."""
import datetime
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
commits = {}
runs = {}
latest_machine_info = {}
for path in sorted(root.glob('runs/*/*/result.json')):
    sha, machine_id = path.parent.parent.name, path.parent.name
    result = json.loads(path.read_text(encoding='utf-8-sig'))
    runs.setdefault(sha, {})[machine_id] = result
    if result.get('commit'):
        commits.setdefault(sha, result['commit'])
    # Machine list on page uses info from the newest run of each machine, so driver updates show up.
    info = result.get('machine')
    started = result.get('started', '')
    if info and started >= latest_machine_info.get(machine_id, ('', None))[0]:
        latest_machine_info[machine_id] = (started, {'id': machine_id, **info})

index = {
    'generated_at': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    'machines': [latest_machine_info[machine_id][1] for machine_id in sorted(latest_machine_info)],
    'commits': commits,
    'runs': runs,
}
(root / 'index.json').write_text(json.dumps(index, indent=1) + '\n', encoding='utf-8')
print(f'index.json: {len(index["machines"])} machines, {len(runs)} commits.')
