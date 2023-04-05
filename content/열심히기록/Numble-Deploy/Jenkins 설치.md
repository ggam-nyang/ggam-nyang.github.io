---
emoji: 🔥
title: 테라폼이란?
date: '2023-03-28 22:00:00'
author: 지구깜냥
tags: Jenkins Devops 클라우드 배포 deploy
categories: DevOps
---
## Jenkins
CI/CD를 위한 툴이다.

로컬 docker에 띄워 사용해본 후, Github hook과 연결하기 위해 ec2에 Jenkins를 띄웠다.

[https://www.jenkins.io/doc/book/installing/](https://www.jenkins.io/doc/book/installing/)에 OS별 설치 방법이 상세히 나와있다.

현재 이해한 내용은
- Jenkins를 8080 포트 (다른 포트도 가능)에 띄운다.
- localhost:8080를 통해 Jenkins 설정 페이지에 접근하여 설정할 수 있다.
- 이런 설정은 cli로도 가능할 듯 싶고, 사이트 내에서 `PipeLine`, `Item`등을 만들 수 있다.
- Github repo의 `Jenkinsfile`을 실행하는 방식의 Pipeline을 만들면 해당 사이트에서 build하고 결과를 확인할 수 있다.


구현 과정은 ansible 스크립트 작성 이후 해보자!


결국 구현할 구조는

push(Gihub action)
-> Jenkins 서버에서 확인 후 build + deploy
-> terraform 이용, web-server 구축 및 배포
-> Ansible이 이 과정을 지원하는듯..?

ec2를 생성하는 Terraform과 해당 ec2에 웹서버를 구축하고 배포하는 Anisble 스크립트를 통해
CD를 구현하면 될 듯하다.