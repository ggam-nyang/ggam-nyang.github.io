---
emoji: 🌱
title: Sealed Class
date: '2023-03-31 22:00:00'
author: 지구깜냥
tags: Kotlin 코틀린 코틀린인액션 Kotlin-in-Action 개발자 Developer
categories: Kotlin
---
## Sealed Class
>[코틀린 sealed class 공식문서](https://kotlinlang.org/docs/sealed-classes.html)를 참고했습니다.
### 목적
클래스의 상속을 더 제어하기 위해 사용한다.

코틀린은 예약어를 통해 컴파일 과정에서 편의성을 제공하는 방식을 좋아하는 듯 하다.

```kotlin
interface Expr
class Num(val value: Int) : Expr
class Sum(val left: Expr, val right: Expr) : Expr

fun eval(e: Expr): Int =
    when (e) {
        is Num -> e.value
        is Sum -> eval(e.right) + eval(e.left)
        else ->
            throw IllegalArgumentException("Unknown expression")
    }
```
이 구조에서, when 식의 else를 주목하자.

`Expr`를 구현한 새로운 Class가 생긴다면, else문은 논리 오류가 될 수 있다.
즉, 하위 클래스가 추가 됐을 때 컴파일러가 when이 모든 분기를 처리하는지 알 수 없다.
또 새로운 클래스 처리를 잊어버려도 알 수 없다.

이 **문제**에 대한 해법이 `sealed class`이다.

```kotlin
sealed class Expr {
    class Num(val value: Int) : Expr()
    class Sum(val left: Expr, val right: Expr) : Expr()
}

fun eval(e: Expr): Int =
    when (e) {
        is Num -> e.value
        is Sum -> eval(e.right) + eval(e.left)
    }
```

`sealed class`를 상속하는 하위 클래스는 ~~무조건 중첩 클래스로 구현되어야 한다.~~
when식이 모든 하위 타입을 검사하는지 컴파일러는 알 수 있고, 새로운 클래스가 분기처리 되지 않으면 컴파일 오류가 난다.

`sealed class`는 그 자체로 abstract 하고, 인스턴스화 할 수 없다.


코틀린 1.5부터는 너무 많은 제약을 해소했다.

하위 클래스는 중첩 클래스가 아닌 `sealed class`가 정의된 패키지 안에서 구현할 수 있고,
`sealed interface`도 추가됐다.

기존에 `sealed interface`가 없던 이유는 자바에서 해당 인터페이스를 확장하지 못하게 할 방법이 없기 때문이라고 했는데,
이 문제가 어떻게 해결된 것인지 모르겠다.




