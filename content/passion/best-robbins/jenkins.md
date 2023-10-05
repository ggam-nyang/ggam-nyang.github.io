---
emoji: 🌱
title: Jenkins를 통해 CI/CD를 하던 중..
date: '2023-10-05 22:00:00'
author: 지구깜냥
tags: Jenkins CI/CD Infra 개발자 Developer
categories: Infra
---

**베스트라빈스** 프로젝트를 진행하며 Jenkins를 사용했다.
서버 아키텍쳐는 아래와 같다.

Jenkins로 CI / CD를 구축한건 처음이었는데, 그 과정에서 만났던 문제들을 남겨두고자 한다.
Jenkins의 설정 방법 등은 간단히만 적어보겠다.

### Jenkins 설정
Jenkins 서버는 Naver Cloud Platform(NCP)를 사용했다.
micro 버전은 무료이기 때문에 사용했는데, 이후 Compact로 업그레이드했다.
NCP의 서버는 선택한 Jenkins 버전의 이미지를 통해 배포된다. 때문에 18080포트 접근 권한 설정을 하면 웹사이트에서 접근이 가능하다.

JenkinsFile을 통해 관리하는 것과 웹페이지에서 FreeStyle로 프로젝트를 설정하는 방식이 있다.
나는 후자를 택했고 장단을 비교하자면
- 버전관리
    - JenkinsFile은 git을 통해 관리될 수 있어, 버전 관리에 용이하다
- 재사용성
    - JenkinsFile은 코드 형태로 관리하므로, 재사용성이 뛰어나다
- 유지보수
    - 이것도 마찬가지.
- 복잡도
    - JenkinsFile은 Groovy 문법을 익혀야 하고, FreeStyle Project보다는 복잡도가 높다.

결과적으로, JenkinsFile로 작성하고 프로젝트 코드에 포함하는 것이 이상적이다.
그러나 프로젝트의 규모가 작아 우선 FreeStyle project로 설정했다.

### Jenkins로 어떤 일을?
Jenkins에게 바라는 것은 CI 와 CD였다.

CI는 아래와 같이 구성했다.
- Github Webhook을 등록 (develop 브랜치 commit 발생 시, hook을 보냄)
- webhook이 발생하면 Jenkins 서버에서 어떤 일을 수행할지 설정
    - Build Step에서 간단히 Clean, build 만 수행

CD
- Publish Over SSH 플러그인을 통해, WAS 서버에 SSH 접근 설정
- CI 과정에서 빌드한 jar 파일을 WAS 서버에 복사하고, 스크립트를 실행함

축약하자면 이런 과정을 통해 CI/CD를 해준다.

###  어떤 문제들이..!
Jenkins는 Spring을 사용해서 서버를 구축하는게 아니라 인프라를 위한 도구이다 보니
에러도 생소하고, 에러 핸들링 자체가 조금 어려웠다.
단순한 오류도, 매번 빌드를 통해 확인하다보니 시간도 오래걸렸다.

Publish Over SSH 라는 Jenkins 플러그인을 사용했다.
그 외에도 이전에 맛만 본 Ansible, Terraform 등을 통해 CI/CD를 자동화 할 수도 있을 것이다. (너무 어렵다..)

Jenkins 서버 -> WAS 서버에 jar 복사 과정에서 연결 설정은 22포트를 열어줌으로 해결했다.
그러나 이런 방식은 보안에 좋지 않다고 생각되는데,
- Jenkins 서버의 보안 문제 == WAS 서버 보안 문제
- 복잡도 증가: ssh key 관리, WAS에 Script 파일을 관리
- 두 서버 간의 네트워크 연결에 의존하게 됨

argo CD나 여타 다른 인프라 툴을 공부하고 사용해보며 비교해보면 좋겠다!

#### 문제 1. Jar 파일 경로
Remote directory 경로를 `/home/ubuntu/best-robbins/jar`로 절대경로로 명시했다.
Jar 파일이 복사는 됐지만 실행되지 않았는데, 이유는
`/home/ubuntu/home/ubuntu/best-robbins/jar` 경로에 복사가 됐기 때문이다.

원인이 무엇일까?
확실한건 기본 path가 /home/ubuntu/best-robbins 로 설정되어 있다는 것이다.
/home/ubuntu 까진 이해가 되지만, 내가 만든 폴더가 기본 path가 된 이유를 잘 모르겠다.
bashrc, bash_profile, PATH, HOME 등 모든 설정을 확인해봤지만 best-robbins 폴더가 경로로 설정된 경우는 없었다. 물론 Jenkins 설정에서 해당 폴더 경로를 지정한 적도 없고 말이다.

Publish Over SSH를 사용했기에, 해당 플러그인에 문제가 있을 수도 있지만 WAS 서버의 설정 문제 같은데, 정확한 원인을 밝히지 못했다..... 정확한 Logging 통해 문제를 파악해 봐야한다.

#### 문제 2. sudo java 실행 시 환경변수 문제
application-dev.yml에 정의한 DATABASE 정보가 있다. PATH, password, username 등을 정의했는데, 보안을 위해 WAS 서버에 환경변수로 등록했다.

문제는 `sudo java -Dspring.profiles.active=dev -jar /home/ubuntu/jar/your-jar-file.jar`
와 같이 실행할 때 환경변수가 작동하지 않았다.

**원인** : sudo로 실행하면 환경변수가 다르다!
전혀 몰랐던 사실인데, sudo -E 옵션을 지정해줘야 설정한 환경변수를 사용할 수 있다. 때문에 환경변수를 포함해 실행하기 위해서는 -E 옵션을 붙여주자.

#### 문제 3. 인터렉티브 모드
Jenkins 서버는 jar 파일을 복사 후, WAS 서버에 존재하는 스크립트 실행을 위해
`sh /my/script.sh` 명령어를 실행한다. 해당 스크립트는 기존 스프링 서버를 종료하고, 새롭게 jar 파일을 실행한다.
문제는 환경변수가 또!! 제대로 작동하지 않았다.

**원인** : 콘솔에서 스크립트 실행 시 문제가 없었다. 결국 Jenkins에서의 접근이 문제인데, 내가 지정한 환경변수는 bashrc에 저장되어 있고, 서버가 실행될 때 source ~/.bashrc 가 실행된다.
bashrc를 뜯어보면 아래와 같은 내용이 있다.
```shell
# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
```

Jenkins를 통해 접근한 경우 non-interactive mode이다. 때문에 bashrc 자체가 실행되지 않는다.
때문에
- 스크립트 내에서 bashrc를 활성화
- systemd와 같은 서비스 관리 도구를 사용
- script 내에 export 명령어를 저장
  등의 방법으로 해결할 수 있다.


이런 과정을 통해 CI/CD를 설정했따. 시간이 꽤 지나고 두서없이 적었더니, 정말 끔찍한 글이 됐다.

빠른 개발을 위해 선택한 방법들이 많아서, 보다 좋은 설계를 가진 CI/CD로 업그레이드 해볼 예정이다!