# Api

Декларативное описание валидаций

    !!DemoWithCode!!./ContactInfoDemo

Метод `prop` позволяет прогрузиться до нужного узла контракта

    const validate = createValidator<ContactInfo>(b => {
      b.prop(x => x.name, b => {
        //...
      });
    });

Полученная функция `validate` возвращает дерево валидаций по контракту данных

    const validation = validate(contactInfo);

Метод `getNode` прогружается до конкретного узла дерева, а метод `get` возвращает объект валидации узла

    const validationInfo = validation.getNode(x => x.name).get()

Объект `validationInfo` передается в `ValidationWrapperV1`

    <ValidationWrapperV1 validationInfo={validationInfo}>
      <Input/>
    </ValidationWrapperV1>




Функция `createValidator` создает функцию валидации данных

    type Validator<T> = (value: T) => ValidationReader<T>;
    createValidator: <T>(rule: RootValidationRule<T>) => Validator<T>

Описание валидаций происходит с помощью функций-правил

    type ValidationRule<TRoot, T> = (builder: ValidationBuilder<TRoot, T>, value: T) => void;
    type ItemValidationRule<TRoot, T> = (builder: ValidationBuilder<TRoot, T>, index: number, value: T) => void;
    type RootValidationRule<T> = ValidationRule<T, T>;

Декларативное описание валидаций

    interface Fio {
      surname: string;
      name: string;
    }
    
    interface Entity {
      fio: Fio;
      email: string;    
    }
    
    const valiate = createValidator<Entity>(b => {
      b.prop(x => x.fio, b => {
        b.props(x => x.name, b => {
          b.invalid(x => !!x, "Укажите имя", "submit");
        });
        b.props(x => x.surname, b => {
          b.invalid(x => !!x, "Укажите фамилию", "submit");
        });
      });
      b.props(x => x.email, b => {
        b.invalid(x => !x, "Укажите email", "submit");
        b.invalid(x => !/^[a-z]+@[a-z]+\.[a-z]+$/.test(x), "Неверный формат email", "lostfocus");
      });
    });



## Демо
