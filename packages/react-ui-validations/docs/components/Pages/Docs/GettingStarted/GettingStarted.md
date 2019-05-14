# Начало работы

[![Version](https://img.shields.io/badge/npm-${process.env.libraryVersionEscaped}-orange.svg?style=flat-square)](https://www.npmjs.com/package/react-ui-validations)

Исходный код [на GitHub](https://github.com/skbkontur/retail-ui/tree/master/packages/react-ui-validations).

Библиотека реализует поведение [валидаций по контур-гайдам](https://guides.kontur.ru/principles/validation/).

Библиотека совместима с контролами из библиотеки [retail-ui](https://tech.skbkontur.ru/react-ui/).

## Установка

    npm install --save react-ui-validations

## Использование

Для отборажения валидаций используется два компонента `ValidationWrapperV1` и `ValidationContainer`.
Компонент `ValidationWrapperV1` оборачивает контрол, для которого должна отобразиться валидация.
Компонент `ValidationContainer` оборачивает всю валидируемую форму, внутри которой используются компоненты `ValidationWrapperV1`.

    <ValidationContainer>
      //...
        <ValidationWrapperV1 validationInfo={...}>
          <Input/>
        </ValidationWrapperV1>
      //...
    </ValidationContainer>

Значение валидации задается через проп `validationInfo` компонента `ValidationWrapperV1`.

Невалидное состояние задается объектом валидации `validationInfo={{message: "..."}}`. Сообщением об ошибке может быть React-компонент.

    <ValidationWrapperV1 validationInfo={{message: <>Ошибка <b>!!!</b></>}}>
      <Input/>
    </ValidationWrapperV1>

Валидное состояние задается значением `validationInfo={null}`.

    <ValidationWrapperV1 validationInfo={null}>
      <Input/>
    </ValidationWrapperV1>

Пример

    !!DemoWithCode!!./StaticValidationDemo

Обычно валидация вычисляется динамически по текущему значению контрола.
Для корректоного отображени нужно передавать всегда актуальное состояние валидации.
Компонент `ValidationWrapperV1` сам примет решение, когда подсветить котрол и отобразить сообщение об ошибке.

    const value = this.state.value;
    const validationInfo = !isValid(value) ? {message: "Error"} : null;

    <ValidationWrapperV1 validationInfo={validationInfo}>
      <Input value={value} />
    </ValidationWrapperV1>

Пример

    !!DemoWithCode!!./ConditionalValidationDemo
