---
emoji: ✏️
title: c++의 가상 함수란!
date: '2024-01-30 22:00:00'
author: 지구깜냥
tags: c++ cpp virtual function
categories: C++
---

# 가상 함수

[가상 함수 vs 순수 가상 함수](https://www.geeksforgeeks.org/difference-between-virtual-function-and-pure-virtual-function-in-c/)    
[가상 함수 한글자료](https://tcpschool.com/cpp/cpp_polymorphism_virtual)  
[가상 함수 런타임](https://www.geeksforgeeks.org/virtual-functions-and-runtime-polymorphism-in-cpp/)

### 가상 함수
가상 함수는 클래스 멤버 변수에 선언할 수 있고, 함수 호출에 사용된 타입(포인터)에 관계없이 실제 객체의 함수가 호출되도록 한다.
몇 가지 특징, 규칙은 아래와 같다.

- 런타임 다형성을 구현할 수 있다.
   - 이를 위해 상위 클래스 타입을 사용해야한다.
- 가상 함수는 하위 클래스에서 꼭 override 해야하는 것은 아니다.
- 가상 함수의 시그니처는 동일해야한다.
- 가상 생성자는 불가능하다. 소멸자는 가능

어떻게 이런 동작을 할까?
- RTTI(RunTime Type Information)을 활용한다.
- 클래스와 객체를 생성할 때 각각 VTable, VPtr이 생성된다.
  
아래 예시를 보자.

```cpp
#include <iostream>
using namespace std;

class base {
public:
	virtual void print() { cout << "print base class\\n"; }

	void show() { cout << "show base class\\n"; }
};

class derived : public base {
public:
	void print() { cout << "print derived class\\n"; }

	void show() { cout << "show derived class\\n"; }
};

int main()
{
	base* bptr;
	derived d;
	bptr = &d;

	bptr->print(); // derived.print()

	bptr->show(); // base.show()

	return 0;
}

```

각 `bptr = &d` 에서 실제 derived 객체를 생성하고, 타입은 base 포인터이다.
이때 derived 객체는 멤버 변수로만 이뤄지지 않고, VPtr이라는 주소값이 할당된다.
이 VPtr은 실제 이 객체의 가상 함수 테이블(VTable)을 가르킨다.

이렇게 함수를 호출할 때 어느 블록(테이블)에 있는 함수를 실행할지 결정하는 것을 바인딩이라고 한다.  
대부분 함수를 호출하는 코드는 컴파일 시점에 고정된 메모리 주소로 변환된다.  
이를 **정적 바인딩**이라 하고, 위와 같은 경우를 **동적 바인딩**이라 한다.

때문에 런타임에 \*bptr 객체는 실제 어떤 함수를 호출해야 하는지 알 수 있다.

### 순수 가상 함수
순수 가상 함수는 `virtual void func() = 0` 과 같이 구현한다.
이와 같은 순수 가상 함수가 1개 이상 포함된 클래스는 추상 클래스가 된다.
때문에 객체를 생성할 수 없고, 하위 클래스는 해당 함수를 반드시 구현해야한다. (아니라면 마찬가지로 추상 클래스)
자바의 interface를 이용해 유연한 설계를 한다면, 순수 가상 함수를 섞어 interface 역할의 클래스를 생성할 수 있을 것이다.

