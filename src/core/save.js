const KEY = 'pnp.save.v1';

const blank = () => ({
  version: 1,
  completed: [],
  current: null,
  startedAt: null,
  completedAt: null,
  hints: 0,
  wrong: 0,
  findings: 0
});

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return {
      ...blank(),
      ...parsed,
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((x) => typeof x === 'string') : []
    };
  } catch {
    return blank();
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // The game still works for this session when storage is unavailable.
  }
}

export const save = {
  get() {
    return read();
  },
  reset() {
    write(blank());
  },
  markStarted(levelId) {
    const data = read();
    if (!data.startedAt) data.startedAt = Date.now();
    data.current = levelId;
    write(data);
  },
  markComplete(puzzle, { hints = 0, wrong = 0, findings = 0 } = {}) {
    const data = read();
    if (!data.startedAt) data.startedAt = Date.now();
    if (!data.completed.includes(puzzle.levelId)) data.completed.push(puzzle.levelId);
    data.current = puzzle.levelId;
    data.hints += hints;
    data.wrong += wrong;
    data.findings += findings;
    if (puzzle.unitComplete) data.completedAt = Date.now();
    write(data);
  },
  isComplete(levelId) {
    return read().completed.includes(levelId);
  },
  unitComplete(levelIds) {
    const data = read();
    return levelIds.every((id) => data.completed.includes(id));
  },
  nextUnfinished(levelIds) {
    const data = read();
    return levelIds.find((id) => !data.completed.includes(id)) || levelIds[levelIds.length - 1];
  },
  firstPlayable(levelIds) {
    const data = read();
    for (let i = 0; i < levelIds.length; i += 1) {
      if (!data.completed.includes(levelIds[i])) return levelIds[i];
    }
    return levelIds[levelIds.length - 1];
  }
};
