import { toggleButtonState } from './validation.js';

// Универсальная функция для закрытия поп-апа нажатием на Esc
function closeEsc(evt) {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_is-opened');
    if (openedPopup) {
      closePopup(openedPopup);
    }
  }
}

// Функция для закрытия поп-апа кликом на оверлей
function handleOverlay(evt) {
  if (evt.target.classList.contains('popup')) {
    closePopup(evt.target);
  }
}

// Функция для открытия поп-апа
function openPopup(popup) {
  const errorMessages = popup.querySelectorAll('.popup__error');
  const inputs = Array.from(popup.querySelectorAll('.popup__input'));
  const submitButton = popup.querySelector('.popup__button');

  // Открываем поп-ап
  popup.classList.add('popup_is-opened');

  // Очищаем сообщения об ошибках
  errorMessages.forEach((errorElement) => {
    errorElement.textContent = '';
  });

  // Убираем стили ошибок с полей ввода
  inputs.forEach((input) => {
    input.classList.remove('popup__input_type_error');
  });

  // Обновляем состояние кнопки отправки
  if (submitButton) {
    toggleButtonState(inputs, submitButton);
  }

  // Добавляем обработчики событий
  document.addEventListener('keydown', closeEsc);
  popup.addEventListener('mousedown', handleOverlay);
}

// Функция для закрытия поп-апа
function closePopup(popup) {
  popup.classList.remove('popup_is-opened');

  // Убираем обработчики событий
  document.removeEventListener('keydown', closeEsc);
  popup.removeEventListener('mousedown', handleOverlay);
}

export { openPopup, closePopup };
