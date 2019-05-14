# Api

Декларативное описание валидаций

    !!DemoWithCode!!./EmailInputDemo

Функция `createValidator` создает функцию валидации данных

    const validate = createValidator<string>(b => {
      //...
    });

Метод `invalid` задает правило валидации.
Правила применяются последовательно до первого сработавшего.

    const validate = createValidator<string>(b => {
      b.invalid(x => !x, "Укажите email", "submit");
      b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email");
    });


Полученная функция `validate` возвращает дерево валидаций.
В валидируемом контракте данных отсутсвует вложенность, так как Email - примитивный тип string.
Поэтому результирующее дерево валидаций будет вырожденным, с одним узлом - корневым.

    const validation = validate(email);

Метод `get` возвращает объект валидации узла

    const validationInfo = validation.get()

Объект `validationInfo` передается в `ValidationWrapperV1`

    <ValidationWrapperV1 validationInfo={validationInfo}>
      <Input/>
    </ValidationWrapperV1>

Каждый вызов метода `validate` заново применяет все правила валидации и возвращает новое дерево валидаций.
