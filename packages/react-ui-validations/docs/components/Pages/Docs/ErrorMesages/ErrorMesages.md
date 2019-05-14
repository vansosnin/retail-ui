# Сообщения об ошибках

[Сообщения об ошибках по гайдам](https://guides.kontur.ru/principles/validation/#Soobscheniya_ob_oshibkah)

По умолчанию сообщение обошибке отображается в тултипе справа от контрола

Умолчательное поведение переопределяется с помощью пропа `renderMessage` компонента `ValidationWrapperV1`

    <ValidationWrapperV1 validationInfo={...} renderMessage={...}>
      //...
    </ValidationWrapperV1>

## Тултипы

Для переопределения отборажения тултипа используется метод `tooltip`.
Аргументов метода задается позиция отображения тултипа.

    <ValidationWrapperV1 validationInfo={...} renderMessage={tooltip("top left")}>
      //...
    </ValidationWrapperV1>

Пример

    !!DemoWithCode!!./TooltipValidationDemo

## Тексты

Для переопределения отборажения текста используется метод `text`.
Аргументов метода задается позиция отображения текста.
По умолчанию позиция `right`.

    <ValidationWrapperV1 validationInfo={...} renderMessage={text("bottom")}>
      //...
    </ValidationWrapperV1>

Пример

    !!DemoWithCode!!./TextValidationDemo
