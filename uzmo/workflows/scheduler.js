export function nextRunAt(trigger, now = new Date()) {
  if (!trigger || trigger.type !== "schedule") return null;
  const everyMinutes = Number(trigger.everyMinutes);
  if (Number.isFinite(everyMinutes) && everyMinutes > 0) return new Date(now.getTime() + everyMinutes * 60000).toISOString();
  if (trigger.cron) return { cron: trigger.cron };
  return null;
}
export function validateSchedule(trigger) {
  if (!trigger || trigger.type !== "schedule") return { valid: true };
  if (!trigger.cron && !(Number(trigger.everyMinutes) > 0)) return { valid: false, error: "Schedule requires cron or everyMinutes." };
  return { valid: true };
}
