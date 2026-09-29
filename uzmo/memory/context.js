export function buildContext({ messages = [], memories = [], retrieved = [] } = {}) {
  return {
    recent_messages: messages.slice(-20),
    memories: memories.slice(-20),
    retrieved: retrieved.slice(0, 8)
  };
}

export function addMessage(messages, role, content) {
  return [...messages, { role, content, created_at: new Date().toISOString() }].slice(-50);
}
