//Пока что не работает, надо исправлять


// import createInput from '../../Components/InputComponent/InputComponent.js';
// import Ajax from '../../modules/ajax.js';
//
//
// class LoginForm {
//     constructor() {
//         this.form = document.createElement('form');
//         this.emailInput = createInput('email', 'Емайл', 'email');
//         this.passwordInput = createInput('password', 'Пароль', 'password');
//         this.submitBtn = document.createElement('input');
//         this.submitBtn.type = 'submit';
//         this.submitBtn.value = 'Войти!';
//
//         // Добавляем элементы в форму
//         this.form.appendChild(this.emailInput);
//         this.form.appendChild(this.passwordInput);
//         this.form.appendChild(this.submitBtn);
//
//         // Обработчик отправки формы
//         this.form.addEventListener('submit', this.handleSubmit.bind(this));
//     }
//
//     handleSubmit(event) {
//         event.preventDefault();
//
//         const email = this.emailInput.value.trim();
//         const password = this.passwordInput.value;
//
//         Ajax.post({
//             url: '/login',
//             body: { password, email },
//             callback: (status) => {
//                 if (status === 200) {
//                     menu.goToPage(menu.menuElements.feed);
//                     return;
//                 }
//
//                 alert('НЕВЕРНЫЙ ЕМЕЙЛ ИЛИ ПАРОЛЬ');
//             }
//         });
//     }
//
//     // Метод для получения формы
//     getForm() {
//         return this.form;
//     }
// }
//
// export default LoginForm;
