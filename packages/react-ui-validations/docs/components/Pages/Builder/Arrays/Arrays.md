# Валидация массивов

Описание валидаций элементов массива реализовано аналогично описанию валидаций полей объекта.

##  Массив примитивных типов
### Описание правил валидаций

    const validate = createValidator<string[]>(b => {
      b.array(x => x, b => {
        b.invalid(x => !x, "Укажите email", "submit");
        b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email");
      });
    });

Метод `array` прогружается до узла содержащего массив.
В колбэке задается правило валидации для элемента массива.
Правило последовательно применяется к каждому элементу массива.

    b.array(x => x, b => {
      //правило для элемента массива
    });

В приведенном примере корневой узел является массивом.
Поэтому прогрузка сделана до текущего узла c помощью выражения `x => x`.

### Получение объектов валидаций

Метод `validate` возвращает дерево валидаций.
Метод `getNodeByIndex` возвращает узел дерева по индексу массива.
Объект валидации из узла дерева извлекается методом `get`.

    const validation = validate(emails);
    const validationInfo = validation.getNodeByIndex(0).get();

Объект `validationInfo` можно передать в проп компонента `ValidationWrapperV1`

    <ValidationWrapperV1 validationInfo={validationInfo}>
      <Input/>
    </ValidationWrapperV1>

### Пример

    !!DemoWithCode!!./PrimitiveTypeArrayDemo


