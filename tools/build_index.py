"""Rebuilds index.json from results of engine commits in runs/<engine commit sha>/<machine>/
and editor/index.json from results of editor commits in editor/runs/<editor commit sha>/<machine>/.
Results of a commit on a machine are kept by suite, in <suite name>/result.json, a result from before suites
were kept apart is result.json right in the folder of the machine. The index has a list of results for every commit and machine."""
import datetime
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent


def build_index(runs_folder, index_file):
    commits = {}
    runs = {}
    latest_machine_info = {}
    for machine_folder in sorted(path for path in (root / runs_folder).glob('*/*') if path.is_dir()):
        sha, machine_id = machine_folder.parent.name, machine_folder.name
        paths = [machine_folder / 'result.json'] + sorted(machine_folder.glob('*/result.json'))
        results = [json.loads(path.read_text(encoding='utf-8-sig')) for path in paths if path.is_file()]
        if not results:
            continue

        runs.setdefault(sha, {})[machine_id] = results
        for result in results:
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
    (root / index_file).parent.mkdir(parents=True, exist_ok=True)
    (root / index_file).write_text(json.dumps(index, indent=1) + '\n', encoding='utf-8')
    print(f'{index_file}: {len(index["machines"])} machines, {len(runs)} commits.')


build_index('runs', 'index.json')
build_index('editor/runs', 'editor/index.json')
