export async function withRetry(task, { retries = 2, backoffMs = 250, shouldRetry = defaultRetry } = {}) {
  let lastError;
  for (let attempt=0; attempt<=retries; attempt++) {
    try { return await task(attempt); } catch (error) {
      lastError=error;
      if (attempt===retries || !shouldRetry(error)) throw error;
      await new Promise(resolve=>setTimeout(resolve, backoffMs * (2 ** attempt)));
    }
  }
  throw lastError;
}
function defaultRetry(error) { return /timeout|network|HTTP (429|500|502|503|504)/i.test(String(error?.message||"")); }
