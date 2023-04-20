---
emoji: 💻
title: Gradle kotlin? 
date: '2023-04-20 23:00:00'
author: 지구깜냥
tags: Gradle Kotlin Dev develop
categories: 개발
---

> **모든 것을 궁금해한다!**

## 프로젝트 세팅
프로젝트를 새로 시작할 때 https://start.spring.io/ 를 애용한다.
의존성 추가가 간편하고 Spring 버전 업데이트에 따라 최신화 돼서 좋다.

### Gradle vs Maven ?
항상 Gradle만을 선택해 왔는데, 둘은 어떤 차이가 있을까?
(참조: https://www.geeksforgeeks.org/difference-between-gradle-and-maven/)

Gradle, Maven은 소프트웨어 빌드에 사용되는 툴이다.

#### Maven
오픈 소스 프로젝트로 정해진 lifecycle로 다양한 소프트웨어를 관리하는 툴이다.
이는 짧은 기간안에 표준 레이아웃에서 표준화된 개발에 중점을 둔다.

XML을 이용하고 Java project를 다른 언어로도 사용할 수 있도록 해준다.

장점
- 빌드를 단순화하고 잘 구축한다.
- 다양한 의존성을 자동으로 관리해준다. Jar 파일들을 다운한다.
- POM 파일에서 의존성을 관리하고 추가하기 편하다.
- 필수 정보에 접근이 쉽다. (POM에 정의하기 때문일까?)
- 확장 가능하고, 스크립트 언어 or Java로 플러그인 작성이 가능하다.

단점
- 설치가 필수다.
- 기존 의존성에 대한 Maven 코드가 없으면 Maven을 사용하여 구현할 수 없다.
- 실행면에서, 느리다.

#### Gradle
오픈소스이며 소프트웨어 빌드를 자동화 해준다.
생산성이 좋아 널리 사용되고 Java, Groovy DSL로 사용할 수 있다.

모바일, 웹 어플리케이션의 빌드 + 배포를 도와준다. 

장점
- 커스텀 자유도가 매우 높다. (다양하게 활용할 수 있다 프로젝트마다)
- maven의 약 2배 속도로 빠르다.
- 플러그인을 만들 수 있고 유연하다.
- 다양한 IDE에서 제공된다.

단점
- 충분한 이해도가 필요하다.
- 프로젝트에 내장된 형태로 제공되지 않는다. (별도의 파일들이 제공되어야 한다는 뜻인듯?)
- 공식 문서가 너무 광범위하다.
- 빌드를 도와주는 Ant 빌드 스크립트는 XML이 필요하고, 고도화된 프로젝트에서 자동화 하려면 많은 로직을 XML에 작성해야한다.


[Gradle 공식 문서](https://gradle.org/maven-vs-gradle/)도 보면
**유연성, 성능, 사용성**을 강조한다.

결과적으로 Gradle이 더 좋다고 느껴진다.<br>
```markdown
- xml보다 스크립트 작성이 용이
- C/C++ 등에서도 사용 가능한 유연성
- 속도 차이 등 성능
```

### Gradle Groovy vs Kotlin ?
사실 이게 궁금해서 찾아보게 됐다.

https://blog.gradle.org/kotlin-meets-gradle 문서에서 Kotlin DSL을 사용하게 된 이유들이 나와있다.

요약하면
- 자동 완성 및 콘텐츠 지원 (IDE의 지원을 말한다.)
- 빠른 문서화 (Gradle 문서화를 말하는건지 모르겠다.)
- 소스 탐색
- 리팩토링 등

내가 경험한 큰 장점은 Gradle 파일을 **Kotlin 언어로 작성**할 수 있다는 것과
**IDE에서 구문 오류를 잘 잡아주는 것**이다.

이번 프로젝트도 Gradle-Kotlin으로 고고!
