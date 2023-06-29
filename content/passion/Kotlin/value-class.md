---
emoji: 🌱
title: Value Class
date: '2023-06-29 22:00:00'
author: 지구깜냥
tags: Kotlin 코틀린 개발자 Developer ValueClass
categories: Kotlin
---
>[NextStep - TDD, 클린 코드 with Kotlin](https://edu.nextstep.camp)강의를 참고했습니다.
### Java, Kotlin의 Int

```kotlin
    @Test
    fun test1() {
        val number1 = 1
        val number2 = 1

        assertThat(number1).isEqualTo(number2)
        assertThat(number1).isSameAs(number2)
    }

    @Test
    fun test2() {
        val number1 = 1
        val number2 = 1
    
        assertThat(number1 == number2).isTrue
        assertThat(number1 === number2).isTrue
    }
```
두 테스트는 모두 참일까?
당연하게도 그렇다. 코틀린은 타입 추론을 통해, 타입을 명시하지 않아도 number1, number2는 Int가 된다.
여기서 Int는 코틀린의 Primitive type이고 컴파일 된 바이트 코드를 자바를 역컴파일하면 int가 된다.

```kotlin
    @Test
    fun test1() {
        val number1 = 1_000
        val number2 = 1_000

        assertThat(number1).isEqualTo(number2)
        assertThat(number1).isSameAs(number2)
    }

    @Test
    fun test2() {
        val number1 = 1_000
        val number2 = 1_000
    
        assertThat(number1 == number2).isTrue
        assertThat(number1 === number2).isTrue
    }
```
위 경우를 보자.
결과는 테스트2만 통과한다. 이유가 뭘까?
정답은 `isSameAs` 메서드와 자바의 Integer에 있다.

isSameAs 메서드는 Object로 파라미터를 받는다.
```java
    @Override
  public SELF isSameAs(Object expected) {
    objects.assertSame(info, actual, expected);
    return myself;
  }
```
그래서 Test1을 컴파일 후 자바로 디컴파일 해보면
```java
    public final void test2() {
      int number1 = 1000;
      int number2 = 1000;
      Assertions.assertThat(number1).isEqualTo(number2);
      Assertions.assertThat(number1).isSameAs(Integer.valueOf(number2));
   }
```
위와 같다. isSameAs에 int를 넘길 순 없기에 원시타입 int의 래퍼 클래스인 Integer로 변환한다.
때문에 `number1 == number2`지만 `number1 !== number2`이 된다.

다음 테스트를 보자
```kotlin
    @Test
    fun test3() {
        val number1 = Integer.valueOf(1)
        val number2 = Integer.valueOf(1)

        assertThat(number1 == number2).isTrue
        assertThat(number1 === number2).isTrue
    }
```
위 테스트는 어떨까? 마찬가지로 동등성 비교는 통과하지만, 주소값을 비교하는 동일성 비교는 실패할까?
정답은 모두 통과한다.

이유는 Integer 타입에 있다. 
```java
    @IntrinsicCandidate
    public static Integer valueOf(int i) {
        if (i >= IntegerCache.low && i <= IntegerCache.high)
            return IntegerCache.cache[i + (-IntegerCache.low)];
        return new Integer(i);
    }
```
자바의 `Integer`는 내부에 -127 ~ 128 값을 가지는 Integer 객체를 생성해놓았다.
때문에 valueOf 메서드를 통해 Integer(1) 객체를 반복생성해도, 같은 객체가 반환되는 것이다.
자주 사용되는 객체를 반복 생성하지 않고 재활용함으로써 메모리를 효율적으로 사용할 수 있게 된다.

이런 방식을 [Flyweight 패턴](https://refactoring.guru/ko/design-patterns/flyweight)이라 한다.

이 방식을 적용하면 성능을 높일 수 있다.
예를 들어
```kotlin
class Uniform(private val number: Int) {

    companion object {
        private const val MIN_NUMBER = 0
        private const val MAX_NUMBER = 20

        private val uniformMap = (MIN_NUMBER..MAX_NUMBER).associateWith { Uniform(it) }

        fun of(number: Int): Uniform = uniformMap[number] ?: Uniform(number)
    }
}
```
팩토리 메소드를 만들어 관리하면, Uniform 객체는 0~20까지는 같은 인스턴스가 반환이 된다.
private constructor를 사용하는 것도 좋다.

드디어 코틀린의 value class를 이야기해보자!!
Value class의 목적은 결국 최적화에 있다.
`Uniform` 클래스의 경우에도, primitive 타입의 프로퍼티 1개만을 가지는데, 이렇게 래핑할 경우 객체지향 관점에서 이점이 많다.
그러나 컴파일러 입장에선, primitive 타입이 가지는 빠르고 가벼운 이점이 모두 사라지고 런타임 환경에서 훨씬 성능이 저하된다.
이를 위해 래핑되어 있지만, 컴파일 단계에서는 그렇지 않도록 해주는 방식이다! 즉 장점만 취한 느낌이다.


```kotlin
@JvmInline
value class Uniform(private val number: Int) {
    init {
        require(number in 0..20)
    }
}

@Test
fun test4() {
    val uniform1 = Uniform(1)
    val uniform2 = Uniform(1)

    assertThat(uniform1 == uniform2).isTrue
    assertThat(uniform1 === uniform2).isTrue // value class는 동등성 비교는 불가하다.
}
```
이 테스트의 결과는 실패로 예상된다. 그러나 통과한다! 팩토리 메서드와 캐싱을 사용하지 않았음에도 말이다.
자바로 디컴파일해보면
```java
    @Test
   public final void test4() {
      int uniform1 = ValueUniformTest.Uniform.constructor-impl(1);
      int uniform2 = ValueUniformTest.Uniform.constructor-impl(1);
      Assertions.assertThat(ValueUniformTest.Uniform.equals-impl0(uniform1, uniform2)).isTrue();
   }
```
이렇게 나타난다. 우리는 Uniform(1)을 호출했지만, `constructor-impl`이라는 메서드를 호출하고 있다.
이는 value class이기 때문에 자동 생성된 것으로 
```java
    public static int constructor_impl/* $FF was: constructor-impl*/(int number) {
      if (!(0 <= number ? number < 21 : false)) {
         String var3 = "Failed requirement.";
         throw new IllegalArgumentException(var3.toString());
      } else {
         return number;
      }
   }
```
이렇게 만들어준다. 즉 팩토리 메서드를 자동 생성해주는 것과 같다!!
뿐만 아니라 실제 인스턴스를 만들지 않고, 컴파일 단계에서 primitive 타입으로 변경되어 훨씬 효율적인 코드를 작성할 수 있게 된다.

그 외에도 value class의 특징들은 [공식문서 Value class](https://kotlinlang.org/docs/inline-classes.html)를 참고해볼 수 있다!