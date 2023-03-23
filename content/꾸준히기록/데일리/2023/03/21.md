---
emoji: 🧢
title: 2023.03.21(Tue) 첫 매일기록
date: '2023-03-21 22:00:00'
author: 지구깜냥
tags: github 매일기록 Daily 개발자 성장 Developer
categories: 데일리
---
Form은 천천히.. 형 블로그를 흡수해보자 ㅎㅎ

## 💻 개발
### Kotlin
Kotlin in Action을 읽고 정리할 예정.
이미 읽은 부분은 궁금했던 부분만 살펴보며 정리하고, 새로 읽으며 기록하자.


- 코틀린의 빌더 패턴이란, 디자인 패턴 빌더 패턴과 같다. (p.44)
<br>

```kotlin
JuiceBuilder()
        .water(100)
        .ice(20)
        .orange(5)
        .banana(10)
        .build()
```
이처럼 Builder를 만들어 사용하는데, 파라미터가 명시적이고 필수 파라미터를 확인할 수 있다.
외에도 여러 이점이 있어 Lombok에서도 지원하는 패턴인데
코틀린의 경우,
```kotlin
Juice(
    water = 100,
    ice = 20,
    oranger = 5,
    banana = 10
)
```
생성자에 변수 명을 명시할 수 있고, 매개변수별로 기본값을 가질 수 있다.
때문에 이 자체로 빌더 패턴이 구현되어 있어 이를 용이하게 사용하면 좋다.

- 1장은 코틀린의 주요 특성인 다양한 플랫폼, 정적 타입 언어, 함수형 + 객체 지향, 무료 오픈소스 대해 말한다.
- 코틀린의 철학
  - 실용성
  - 간결성
  - 안전성
  - 상호운용성


## 🌙 오늘
- Good
  - 계획했던 일을 대부분 처리
  - 블로그 개설
  - 현대 카드 발급 :sparkle
<br>
- Bad
  - 시간을 아껴 쓰자
  - 오늘 할 일의 우선순위를 잘 정해보자 

## ☀️ 내일
- Kotlin
  - Kotlin in Action
- Spring
  - MVC 강의 마무리
- Algorithm
- 🔥 독서
