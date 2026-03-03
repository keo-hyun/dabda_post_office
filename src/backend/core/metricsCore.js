function createEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildMetricEvent(eventName, payload = {}) {
  return {
    event_id: createEventId(),
    event_name: String(eventName || ''),
    user_id: payload.userId || '',
    meta_json: JSON.stringify(payload.meta || {}),
    created_at: payload.createdAt || new Date().toISOString()
  };
}

module.exports = {
  buildMetricEvent
};
