document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.goods-info'));

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const isButton = e.target.closest('.button');
      if (isButton) {
      }
      cards.forEach(c => c.classList.remove('goods-info--selected'));
      card.classList.add('goods-info--selected');
    });
  });
});