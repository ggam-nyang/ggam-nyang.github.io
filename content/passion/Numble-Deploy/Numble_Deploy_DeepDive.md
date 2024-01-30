---
emoji: 🔥
title: Numble 배포 자동화 딥다이브 회고록
date: '2023-04-09 22:00:00'
author: 지구깜냥
tags: Jenkins Devops 클라우드 배포 deploy numble
categories: DevOps Numble
---

## 결과물
배포 쪽은 처음 공부하다보니, 작업량 산정이 안됐다.

결과적으로, 50%도.. 완성 못한 느낌으로 제출할 수 밖에 없게 됐다 ㅠ

호스트님이 의도한 구조는<br>
1. Terraform으로 클라우드 리소스 생성 및 관리(2개의 ec2 생성)
2. Github push 시, Jenkins 서버에서 Checkout -> build -> deploy 과정을 거침
3. deploy 단계는 Ansible을 이용해 Web 서버에 배포

로 이해했다.

이걸 의도하신게 아닐 수도 있지만..! 내가 이해한 부분은 이렇다.

나는 Spring server를 배포해보려 했고
내가 시도한 부분을 위와 대조해 정리해보면
- Terraform -> VPC 기본 세팅과 2개의 ec2 생성
- Jenkins-ec2에 수동으로 Jenkins 설치 및 설정 후 <br>
Github web hook을 통해 build 성공 <br>
-> 이 과정에서 gradle build 시에는 ec2가 고장이 남.. docker에서 충분히 연습 후에 해야 했는데, 제출날이라 마음이 급했다.
- deploy 단계는 Ansible script를 작성하고 Jenkins pipeline에 추가했지만, build 단계의 오류로 실행은 해보지 못함. <br>
제출 후 다시 천천히 테스트 해보며 구축할 예정!


### 좋았던 점
좋았던 점은 전반적인 인프라 구조를 배웠다.

착각일 수도 있지만, 남은 과정은 찾아보면서 해결할 수 있을 것 같고..?

전체적인 인프라 구조를 공부할 수 있었다. 보안을 위한 Key 설정 등을 다루지 못해서 아쉽지만
못한 부분은 다음주에 해볼 생각이다.

Terraform, Ansible 등을 깊이 있게 다루지는 못했지만, 배포 자동화를 살짝 엿볼 수 있었다.

제일 좋았던 점은 docker와 많이 친해졌다.<br>
이번 딥다이브에서 그나마 친했던게 docker였지만, 제대로 다룰줄 몰랐는데
docker 컨테이너를 띄워서 ubuntu 환경에서 테스트를 진행해보며 많이 배울 수 있었다.


### 아쉬운 점
1. 시간 투자를 많이 못했다.<br>
우선순위에 밀리다보니 원하는 만큼 공부하지 못해 아쉽다. 기한은 지났지만 꾸준히 공부해볼 생각이다.

2. 검색 <<<<<<<< Try <br>
인프라도 결국 docker 환경에서라도 script를 작성해보며 시도하는게 빨리 배운다. <br>
문서를 찾아보는 것도 좋지만, 실행하고 부딪히는게 이해하기도 좋고 막힌 진도를 뚫는데 큰 도움이 됐다.


회고록조차 시간에 쫓겨 아쉬움이 많이 남는다..
제출일 11시 55분이지만!! 같이 신청한 조원들과 마무리까지 달려봐야겠다!!

`다듬어진 회고록과 공부 기록으로 돌아올 예정!!`