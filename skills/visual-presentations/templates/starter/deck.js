const notes = document.getElementById('speaker-notes');
const deck = new Reveal(document.querySelector('.reveal'), {
  embedded: true, width: 1600, height: 900, margin: 0,
  minScale: .1, maxScale: 2, scrollActivationWidth: 0,
  center: false, hash: true, controls: true, progress: true,
  slideNumber: 'c/t', transition: 'none', backgroundTransition: 'none',
  keyboardCondition: () => !notes.open,
});
window.deck = deck;
function refreshNotes() {
  const slide = deck.getCurrentSlide();
  document.getElementById('notes-title').textContent = slide.dataset.title || '';
  document.getElementById('notes-content').innerHTML = slide.querySelector('.notes')?.innerHTML || '';
}
function closeNotes() { notes.close(); document.querySelector('.reveal').focus(); }
document.getElementById('close-notes').addEventListener('click', closeNotes);
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    if (notes.open) closeNotes();
    else { refreshNotes(); notes.showModal(); }
  }
});
deck.on('slidechanged', () => { if (notes.open) refreshNotes(); });
deck.initialize().then(() => {
  const viewport = document.querySelector('.reveal');
  viewport.tabIndex = 0; viewport.focus();
});
