---
emoji: 🌱
title: Spring docs 적용 중 문제
date: '2023-08-06 22:00:00'
author: 지구깜냥
tags: Kotlin Spring 개발자 Developer ValueClass
categories: Spring
---
> [Bottle-letter](https://github.com/HoYunBros/bottle-letter-be) 프로젝트 기록
### Spring docs 적용
Spring Docs는 Swagger와 같이 API docs를 생성해주는 라이브러리다.
**다른점**은 Spring docs는 테스트 코드를 통해 작성된다.

Swagger는 Controller를 스캔하고 자동으로 생성해주며, 타이틀과 같은 커스텀 설정은 코드에 함께 기재하게 된다. (보통 어노테이션 방식)
Spring Docs는 테스트 코드에 API 스펙을 작성하고, asciidoctor를 통해 adoc 파일을 생성하고 html로 변환하여 문서가 작성된다.
쉽게 말해, 테스트 코드를 통해 HTTP spec이 작성되고, 이를 원하는 대로 문서에 삽입하여 문서를 생성한다.

- 상용 코드에 영향을 주지 않는다
- 커스텀 하기 용이하다
- 테스트를 강제한다.
이런 장점을 가졌다. 3가지 모두 굉장히 매력적인 장점이라 Swagger보다 Spring docs를 선택하게 됐다.


### 문제
적용 방법은 쉽게 찾을 수 있다. build.gradles.kts의 일부분은 아래와 같다.
```groovy
val asciidoctorExt: Configuration by configurations.creating
val snippetsDir by extra { file("build/generated-snippets") }

dependencies {
    asciidoctorExt("org.springframework.restdocs:spring-restdocs-asciidoctor")
}

tasks.test {
    outputs.dir(snippetsDir)
}

tasks.asciidoctor {
    inputs.dir(snippetsDir)
    configurations(asciidoctorExt.name)
    dependsOn(tasks.test)
    baseDirFollowsSourceFile()
    doFirst {
        delete {
            file("src/main/resources/static/docs")
        }
    }
}

tasks.register("copyHTML", Copy::class) {
    dependsOn(tasks.asciidoctor)
    from(file("${tasks.asciidoctor.get().outputDir}/index.html"))
    into(file("src/main/resources/static/docs"))
}

tasks.build {
    dependsOn(tasks.getByName("copyHTML"))
}

tasks.bootJar {
    dependsOn(tasks.asciidoctor)
    dependsOn(tasks.getByName("copyHTML"))
}

```

내가 작성한 index.adoc 파일은 아래와 같다.
```asciidoc
ifndef::snippets[]
:snippets: /build/generated-snippets
endif::[]
= API Document
:doctype: book
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 3
:sectlinks:
:docinfo: shared-head

== 소개
Bottle Letter API

include::user.adoc[]
include::bottle.adoc[]
```

`user.adoc`과 `bottle.adoc`은
operation::bottle-me-get[snippets='http-request,http-response'] 등의 형태로 작성했다.

기존에는 `index.adoc` 파일만 생성하고, 안에 모든 내용을 기재했다.
그 당시에는 문제가 없었는데, 위와 같이 리팩토링 후에는 local IDE 에디터에서는 정상적인 html이 생성됐지만,
실제 생성된 html은 `user.adoc`과 `bottle.adoc`을 참조하지 못했다.

문제의 원인은
```groovy
tasks.asciidoctor {
    inputs.dir(snippetsDir)
    configurations(asciidoctorExt.name)
    dependsOn(tasks.test)
    baseDirFollowsSourceFile() // 이녀석
    doFirst {
        delete {
            file("src/main/resources/static/docs")
        }
    }
}
```

여기에 있었다. 에러코드는 ~/bt/user.adoc이 존재하지 않는다라고 나왔다.

index.adoc 파일은 ~/bt/src/docs에 존재했는데 path가 잘못 설정되고 있었다.
기본 path가 위와 같이 인식된 이유는 Asciidoctor의 기본 path에 있다.
- 기본적으로 Asciidoctor는 실행 디렉토리를 baseDir로 사용한다.
- Gradle은 프로젝트의 루트 디렉토리에서 실행된다.
- Asciidoctor 플러그인은 gradle의 실행 디렉토리를 Asciidoctor의 baseDir로 설정한다.

때문에 local 환경에서는 ~/bt/src/docs 폴더 안에 `index.adoc`, `user.adoc`이 존재해서 문서가 잘 생성되어 보였다.

그러나 빌드시에는 ~/bt 를 기본 디렉토리로 파일을 찾기 때문에 인식되지 않았던 것이다.

해결 방법은 asciidoctor 플러그인의 `baseDirFollowsSourceFile()` 메서드이다.
이를 사용하면 각 소스 파일의 디렉토리가 baseDir로 설정된다.

때문에 `index.adoc`에서 `include::user.adoc[]`을 사용하면
`index.adoc`의 경로인 ~/bt/src/docs/user.adoc을 참조하게 된다.


기록을 위한 글이라고 두서없이 적었습니다..!



