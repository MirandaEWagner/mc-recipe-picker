import { chooseRecipes } from './picker.js';
const button = document.querySelector('#choose');
const cards = document.querySelector('#cards');
const status = document.querySelector('#status');
let groups;

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
  render(chooseRecipes(groups));
  status.textContent = 'Three fresh ideas, each from a different tab.';
});

async function load() {
  try {
    const response = await fetch('./recipes.json');
    if (!response.ok) throw new Error('Could not load recipes');
    groups = await response.json();
    if (groups.filter(g => g.recipes.length).length < 3) throw new Error('Not enough recipe tabs');
    button.disabled = false;
    status.textContent = 'A little variety. A lot less deciding.';
  } catch {
    status.textContent = 'The cookbook couldn’t load. Please refresh to try again.';
  }
}
load();
