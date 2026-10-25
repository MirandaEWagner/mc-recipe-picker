export function chooseRecipes(groups, random = Math.random) {
  const pool = groups.filter(group => group.recipes.length).slice();
  if (pool.length < 3) throw new Error('Three recipe tabs are needed.');
  // Fisher–Yates gives every tab an equal chance, regardless of its size.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3).map(group => ({
    ...group.recipes[Math.floor(random() * group.recipes.length)], category: group.name
  }));
}
