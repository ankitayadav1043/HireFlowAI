const randomToken = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
  }

  return Math.random().toString(36).slice(2, 14).toUpperCase();
};

export const generateId = (prefix = 'ID', existingIds = []) => {
  const knownIds = new Set(existingIds);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const id = `${prefix}-${timestamp}-${randomToken()}`;
    if (!knownIds.has(id)) return id;
  }

  throw new Error(`Unable to generate a unique ${prefix} identifier.`);
};

export default generateId;
