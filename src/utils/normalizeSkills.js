const normalizeToken = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]/g, ' ').replace(/\s+/g, ' ').trim();

export const normalizeSkills = (values = []) => {
  const source = Array.isArray(values) ? values : String(values).split(',');
  const seen = new Set();
  return source.map((value) => String(value).trim()).filter((value) => {
    const key = normalizeToken(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const normalizeSkillKey = normalizeToken;

export default normalizeSkills;
