import GettingStarted from './GettingStarted/GettingStarted.md';
import ValidationType from './ValidationType/ValidationType.md';
import ErrorMesages from './ErrorMesages/ErrorMesages.md';
import FormValidity from './FormValidity/FormValidity.md';

export default [
  {
    component: GettingStarted,
    url: 'getting-started',
    caption: 'Начало работы',
  },
  {
    component: ValidationType,
    url: 'validation-type',
    caption: 'Виды валидаций',
  },
  {
    component: ErrorMesages,
    url: 'error-mesages',
    caption: 'Сообщения об ошибках',
  },
  {
    component: FormValidity,
    url: 'form-validity',
    caption: 'Валидность формы',
  },
];
