import { chooseRecipes } from './picker.js';
const button = document.querySelector('#choose');
const cards = document.querySelector('#cards');
const status = document.querySelector('#status');
let groups;
const dropdown = document.querySelector('#cuisine-dropdown');
const options = document.querySelector('#cuisine-options');
const summary = document.querySelector('#cuisine-summary');
const selected = new Set();
function updateSelection() {
  summary.textContent = selected.size ? [...selected].map(name => name.toLowerCase()).join(', ') : 'All cuisines';
  options.querySelectorAll('input').forEach(input => {
    input.disabled = selected.size === 3 && !input.checked;
  });
}
options.addEventListener('change', event => {
  const input = event.target;
  if (input.checked) selected.add(input.value);
  else selected.delete(input.value);
  updateSelection();
});
document.querySelector('#clear-cuisines').addEventListener('click', () => {
  selected.clear();
  options.querySelectorAll('input').forEach(input => { input.checked = false; });
  updateSelection();
});
document.addEventListener('click', event => {
  if (!dropdown.contains(event.target)) dropdown.open = false;
});
dropdown.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    dropdown.open = false;
    dropdown.querySelector('summary').focus();
  }
});

function render(recipes) {
  cards.replaceChildren(...recipes.map((recipe, i) => {
    const card = document.createElement('article');
    card.className = 'card revealed';
    card.style.setProperty('--delay', `${i * 65}ms`);
    const top = document.createElement('div');
    top.className = 'card-top';
    const category = document.createElement('span');
    category.textContent = recipe.category.toLowerCase();
    const number = document.createElement('span');
    number.className = 'number'; number.textContent = `0${i + 1}`;
    top.append(category, number);
    const title = document.createElement('h2'); title.textContent = recipe.title;
    const link = document.createElement('a');
    link.href = recipe.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'View recipe ↗';
    link.setAttribute('aria-label', `View recipe: ${recipe.title} (opens in a new tab)`);
    card.append(top, title, link);
    return card;
  }));
}

button.addEventListener('click', () => {
  dropdown.open = false;
  render(chooseRecipes(groups, Math.random, [...selected]));
  status.textContent = selected.size ? 'Three fresh ideas from your selected cuisines.' : 'Three fresh ideas, each from a different tab.';
});

async function load() {
  try {
    const response = await fetch('./recipes.json');
    if (!response.ok) throw new Error('Could not load recipes');
    groups = await response.json();
    if (groups.filter(g => g.recipes.length).length < 3) throw new Error('Not enough recipe tabs');
    groups.forEach(group => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = group.name;
      const text = document.createElement('span'); text.textContent = group.name.toLowerCase();
      label.append(input, text); options.append(label);
    });
    button.disabled = false;
    status.textContent = 'A little variety. A lot less deciding.';
  } catch {
    status.textContent = 'The cookbook couldn’t load. Please refresh to try again.';
  }
}
load();
