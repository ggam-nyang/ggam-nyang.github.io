---
emoji: 🔥
title: 테라폼이란?
date: '2023-03-28 22:00:00'
author: 지구깜냥
tags: terraform 테라폼 Devops 클라우드 배포 deploy
categories: DevOps
---
## Terraform
[테라폼 공식문서](https://developer.hashicorp.com/terraform/intro)
<br>
### 테라폼?
클라우드 리소스 + on-prem 리소스를 **코드**로 관리할 수 있는 도구.
컴퓨팅, 스토리지, 네트워크 같은 low-level 뿐 아니라 DNS, SaaS 까지도 관리할 수 있다.

### 어떻게?
Terraform은 API를 통해 클라우드 플랫폼 및 기타 서비스에서 리소스를 생성하고 관리한다.
사실상 거의 모든 플랫폼과 함께 동작할 수 있다.

이미 Terraform에서는 다양한 유형의 리소스, 서비스를 관리하기 위해 providers가 작성되어 있고
AWS, Azure, Kubernetes, Github 등등 지원한다.

- Write
  - 여러 클라우드 공급자 및 서비스에 걸쳐 있을 수 있는 리소스를 정의한다.
  예를 들어 보안 그룹과 로드 밸런서가 있는 VPC(Virtual Private Cloud) 네트워크의 가상 시스템에 애플리케이션을 배포하는 구성을 생성할 수 있다.
- Plan
  - 기존 인프라 기반으로 생성, 업데이트 또는 삭제할 인프라에 관한 계획(스크립트?) 작성.
- Apply
  - 승인을 받고, 리소스 종속성을 고려하여 순서대로 실행.
  - 예를 들어 VPC의 속성을 업데이트하고 해당 VPC의 가상 시스템 수를 변경하면 Terraform이 가상 시스템을 확장하기 전에 VPC를 다시 생성.

[https://cloudbim.tistory.com/14](https://cloudbim.tistory.com/14)
해당 블로그를 참고해서 진행했다.

.tf 파일을 생성하여 terraform을 통해 vpc, subnet, igw, rt 그리고 ec2까지 자동 생성했다.
이후 `terraform destroy`로 한번에 해당 리소스를 삭제할 수 있다.

<br>
이제 Ansible을 공부해서 더 적용해보자!