const imageContainer = document.querySelector('.immagine_avatar');

imageContainer.addEventListener('click', function() {
  this.classList.toggle('selected');
});