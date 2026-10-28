document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('#team-list');
  if (!list) return;
  const members = [...list.children];
  for (let index = members.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [members[index], members[randomIndex]] = [members[randomIndex], members[index]];
  }
  const fragment = document.createDocumentFragment();
  members.forEach((member) => fragment.appendChild(member));
  list.appendChild(fragment);
});
