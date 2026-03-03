const WINDOWS = [
  {
    phase: 'PHASE_1',
    start: '2026-03-25T00:00:00+09:00',
    end: '2026-04-08T23:59:59+09:00'
  },
  {
    phase: 'TRANSITION',
    start: '2026-04-09T00:00:00+09:00',
    end: '2026-04-12T23:59:59+09:00'
  },
  {
    phase: 'PHASE_2',
    start: '2026-04-13T00:00:00+09:00',
    end: '2026-04-24T23:59:59+09:00'
  }
];

function resolvePhase(date = new Date()) {
  const time = date.getTime();
  const found = WINDOWS.find((window) => {
    const start = new Date(window.start).getTime();
    const end = new Date(window.end).getTime();

    return time >= start && time <= end;
  });

  return found ? found.phase : 'CLOSED';
}

module.exports = {
  resolvePhase
};
