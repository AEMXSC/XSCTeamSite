export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = inner.textContent;
  block.replaceWith(wrapper);
}
