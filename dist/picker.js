export function chooseRecipes(groups, random = Math.random, selected = []) {
  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const pool = groups.filter(group => group.recipes.length && (!selected.length || selected.includes(group.name)));
  if (!pool.length) throw new Error('No recipes available for these cuisines.');
  // Use each cuisine before repeating one, and draw without replacement.
  const available = new Map(pool.map(group => [group.name, shuffle(group.recipes)]));
  const results = [];
  while (results.length < 3) {
    const round = shuffle(pool.filter(group => available.get(group.name).length));
    if (!round.length) break;
    for (const group of round) {
      results.push({ ...available.get(group.name).pop(), category: group.name });
      if (results.length === 3) break;
    }
  }
  return shuffle(results);
}
