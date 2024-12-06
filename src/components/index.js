// Импорты
import userAvatarImage from '../images/avatar.jpg';
import siteLogoImage from '../images/logo.svg';
import '../pages/index.css';
import { toggleSubmitButtonState } from './validation.js';
import { openPopup, closePopup } from './modal.js';

// Импорт API-функций
import {
  fetchUserProfileData,
  fetchInitialCardsData,
  updateUserProfileData,
  createNewCardData,
  removeCardData,
  addLikeToCardData,
  removeLikeFromCardData,
  updateUserAvatarData,
} from './api.js';

// Применение изображений через JavaScript
const avatarImageElement = document.querySelector('.profile__image');
avatarImageElement.style.backgroundImage = `url(${userAvatarImage})`;

const siteLogoElement = document.querySelector('.header__logo');
siteLogoElement.src = siteLogoImage;

// Элементы на странице для данных пользователя
const profileTitleElement = document.querySelector('.profile__title');
const profileDescElement = document.querySelector('.profile__description');
const profileAvatarImgElement = document.querySelector('.profile__image');

// Контейнер для карточек
const cardContainer = document.querySelector('.places__list');

// Элементы поп-апов
const editProfilePopup = document.querySelector('.popup_type_edit');
const addCardPopup = document.querySelector('.popup_type_new-card');
const imageViewPopup = document.querySelector('.popup_type_image');

// Кнопки закрытия поп-апов
const closePopupButtons = document.querySelectorAll('.popup__close');

closePopupButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const popup = event.target.closest('.popup');
    closePopup(popup);
  });
});

// Форма редактирования профиля
const editProfileButton = document.querySelector('.profile__edit-button');
const profileEditForm = editProfilePopup.querySelector('.popup__form');
const nameInputField = editProfilePopup.querySelector('.popup__input_type_name');
const jobInputField = editProfilePopup.querySelector('.popup__input_type_description');

// Форма добавления новой карточки
const addNewCardButton = document.querySelector('.profile__add-button');
const newCardForm = addCardPopup.querySelector('.popup__form');
const cardTitleInput = addCardPopup.querySelector('.popup__input_type_card-name');
const cardLinkInput = addCardPopup.querySelector('.popup__input_type_url');

// Переменная для хранения ID текущего пользователя
let loggedInUserId = null;

// Загрузка информации о пользователе с сервера
fetchUserProfileData()
  .then((userData) => {
    profileTitleElement.textContent = userData.name;
    profileDescElement.textContent = userData.about;
    profileAvatarImgElement.style.backgroundImage = `url(${userData.avatar})`;
    loggedInUserId = userData._id; // Сохраняем ID текущего пользователя
  })
  .catch((err) => {
    console.error(`Ошибка загрузки профиля: ${err}`);
  });

// Функция для отображения карточек
function displayCards(cards) {
  cards.forEach((cardData) => {
    const cardElement = generateCard(cardData, loggedInUserId);
    cardContainer.append(cardElement);
  });
}

// Загрузка карточек с сервера
fetchInitialCardsData()
  .then((cards) => {
    displayCards(cards);
  })
  .catch((err) => {
    console.error(`Ошибка загрузки карточек: ${err}`);
  });

// Функция для создания карточки
function generateCard(cardData, loggedInUserId) {
  const template = document.querySelector('#card-template').content;
  const cardElement = template.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__delete-button');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  // Проверяем, поставил ли текущий пользователь лайк
  if (cardData.likes.some((user) => user._id === loggedInUserId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // Обработка лайка
  likeButton.addEventListener('click', () => {
    if (likeButton.classList.contains('card__like-button_is-active')) {
      removeLikeFromCardData(cardData._id)
        .then((updatedCard) => {
          likeButton.classList.remove('card__like-button_is-active');
          likeCount.textContent = updatedCard.likes.length;
        })
        .catch((err) => {
          console.error('Ошибка при снятии лайка:', err);
        });
    } else {
      addLikeToCardData(cardData._id)
        .then((updatedCard) => {
          likeButton.classList.add('card__like-button_is-active');
          likeCount.textContent = updatedCard.likes.length;
        })
        .catch((err) => {
          console.error('Ошибка при постановке лайка:', err);
        });
    }
  });

  // Скрываем кнопку удаления, если карточка не принадлежит текущему пользователю
  if (cardData.owner._id !== loggedInUserId) {
    deleteButton.style.display = 'none';
  }

  // Удаление карточки
  deleteButton.addEventListener('click', () => {
    removeCardData(cardData._id)
      .then(() => {
        cardElement.remove();
      })
      .catch((err) => {
        console.error('Ошибка при удалении карточки:', err);
      });
  });

  // Открытие изображения
  cardImage.addEventListener('click', () => {
    const popupImage = imageViewPopup.querySelector('.popup__image');
    const popupCaption = imageViewPopup.querySelector('.popup__caption');
    popupImage.src = cardData.link;
    popupImage.alt = cardData.name;
    popupCaption.textContent = cardData.name;
    openPopup(imageViewPopup);
  });

  return cardElement;
}

// Открытие формы редактирования профиля
editProfileButton.addEventListener('click', () => {
  nameInputField.value = profileTitleElement.textContent;
  jobInputField.value = profileDescElement.textContent;
  openPopup(editProfilePopup);
});

// Обработка отправки формы редактирования профиля
profileEditForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = 'Сохранение...';

  const updatedUserData = { name: nameInputField.value, about: jobInputField.value };
  updateUserProfileData(updatedUserData)
    .then((userData) => {
      profileTitleElement.textContent = userData.name;
      profileDescElement.textContent = userData.about;
      closePopup(editProfilePopup);
    })
    .catch((err) => {
      console.error(`Ошибка обновления профиля: ${err}`);
    })
    .finally(() => {
      submitButton.textContent = 'Сохранить';
    });
});

// Открытие формы добавления новой карточки
addNewCardButton.addEventListener('click', () => {
  cardTitleInput.value = '';
  cardLinkInput.value = '';
  openPopup(addCardPopup);
});

// Обработка отправки формы добавления карточки
newCardForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = 'Создание...';

  const newCardData = { name: cardTitleInput.value, link: cardLinkInput.value };
  createNewCardData(newCardData)
    .then((cardData) => {
      const newCard = generateCard(cardData, loggedInUserId);
      cardContainer.prepend(newCard);
      closePopup(addCardPopup);
    })
    .catch((err) => {
      console.error(`Ошибка добавления карточки: ${err}`);
    })
    .finally(() => {
      submitButton.textContent = 'Создать';
    });
});

const updateAvatarPopup = document.querySelector('.popup_type_update-avatar');
const avatarForm = updateAvatarPopup.querySelector('.popup__form');
const avatarUrlInput = avatarForm.querySelector('.popup__input_type_avatar-url');

// Открытие формы редактирования аватара
profileAvatarImgElement.addEventListener('click', () => {
  openPopup(updateAvatarPopup);
});

// Обработка отправки формы обновления аватара
avatarForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  submitButton.textContent = 'Сохранение...';

  const avatarUrl = avatarUrlInput.value;
  updateUserAvatarData(avatarUrl)
    .then((userData) => {
      profileAvatarImgElement.style.backgroundImage = `url(${userData.avatar})`;
      closePopup(updateAvatarPopup);
      avatarForm.reset();
    })
    .catch((err) => {
      console.error(`Ошибка обновления аватара: ${err}`);
    })
    .finally(() => {
      submitButton.textContent = 'Сохранить';
    });
});
