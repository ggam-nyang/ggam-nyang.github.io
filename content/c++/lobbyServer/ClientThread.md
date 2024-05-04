---
emoji: ✏️
title: 클라이언트 콘솔 입력 스레드 분리하기
date: '2024-05-01 22:00:00'
author: 지구깜냥
tags: c++ cpp boost gameServer LobbyServer
categories: C++ Boost
---

### 클라이언트 스레드 관리
> 요약
클라이언트에서 전투 시작 시 콘솔 입력 + 패킷 처리가 동시에 실행이 되지 않았던 이유는
**콘솔 입력 작업을 중복으로 큐에 추가**하여, 모든 스레드가 블로킹 됐기 때문이다.
>

## 문제 상황

boost asio를 이용해 소켓 프로그래밍을 구축했습니다.
클라이언트의 스레드 구조는 아래와 같습니다.

```cpp
void Client::Start() {
  for (int i = 0; i < 4; i++)
    thread_group_.create_thread([this]() { WorkerThread(); });

  // thread 잘 만들어질때까지 잠시 기다리는 부분
  this_thread::sleep_for(chrono::milliseconds(100));

  io_context_.post([this]() { TryConnect(); });

  thread_group_.join_all();
}

void Client::WorkerThread() {
    ...
  io_context_.run();
    ...
}
```

4개의 작업스레드를 생성하고, io_context에 post된 작업을 스레드가 가져가서 작업을 하는 형태입니다.

post 되는 작업은  
Send() : 콘솔 입력 + 패킷 전송  
Receive() : 패킷 수신 + 콘솔 출력

2개의 작업뿐입니다.

### 이해도 부족
[처음 문제에 대해 다뤘던 문서](https://www.notion.so/non-blocking-482db3eff26f4a23bb9a83676337997e?pvs=21) (읽어보지 않아도 됩니다..!)  
요약 :  
콘솔 입력 작업 / 패킷 수신 작업 2개의 작업이 존재하는데, **패킷 수신 작업이 1초마다 반복될 때**, 두 작업이 동시에 진행되지 않았습니다.

정리했던 문서의 결과는 다음과 같습니다.
getline() 함수는 블로킹 함수이고, 이로 인해 다른 스레드에서 동작해야할 패킷 수신 작업이 진행되지 않았다.
→ **조건 변수**를 통해 10초동안 네트워크 작업이 발생하는 전투 중엔 getLine() 함수가 실행되지 않도록 했습니다.

결론적으로 1번의 디버깅은 **완전한 실패**입니다.

- **블로킹 함수에 대한 이해 부족**
  -  블로킹 함수는 함수의 동작이 완료될 때까지 스레드가 blocking 되는 함수입니다.
     함수가 return 되기 전에는 해당 스레드는 다른 작업을 수행할 수 없습니다.
  - 멀티스레드 프로그래밍의 목적은 CPU 사용량을 높이는 것 입니다. 즉, 블로킹 함수가 실행된다고 해도 다른 스레드가 cpu를 점유해서 일을 할 수 있습니다. 때문에 블로킹과 멀티스레드는 상호보완적인 관계(?)라고 볼 수 있습니다. 
  - 조건 변수를 통해 문제를 해결하긴 했지만, 블로킹 함수로 인해 다른 스레드가 차단되는 것은 아닙니다.  
  
    
- **작업 큐를 통해 실행되는 Boost asio에 대한 이해 부족**
  - Boost asio를 사용해 소켓 서버를 구현할 때, io_context를 사용합니다. 
  - io_context는 async I/O를 도와주고, 이벤트 큐 방식으로 비동기 작업을 처리하도록 해줍니다.

```c++
void Client::Send() {
  getline(std::cin, writeBuffer_);
  packetManager_.SendPacket(this, writeBuffer_);
}

void Client::SendHandle(const system::error_code& ec, const char* packet) {
    ...
  // 재귀적으로 Send()가 post됨
  io_context_.post([this]() { Send(); });
}

// 배틀을 시작하게 될 경우
void Client::Battle() {
    ...
    
    // 마지막에 재귀적으로 Send()를 post하게 됨
    packetManager_.SendAttackPacket(this, 1);
    
    timer_.expires_from_now(std::chrono::seconds(1));
    timer_.async_wait(
      [this](const boost::system::error_code& ec) { Battle(ec); });
}
```

Send, Receive 두 함수는 모두 마지막에 같은 작업을 큐에 post 합니다. 재귀함수와 비슷합니다.    

그런데 전투 중에 1초마다 패킷을 보낼 때도, Send가 post 됐습니다.  
결국, 작업 큐에 Send 10개 Receive 1개가 존재하고 스레드가 4개인 환경에서 모든 스레드가 Send를 실행하며 블로킹되어 Receive를 실행하지 못합니다.

## 해결

- **(현재 임시방편..!)** 단순하게는 `ATTACK_REQUEST` 의 경우 콘솔 입력과 분리하고 Send 함수를 작업 큐에 추가하지 않습니다.
  - 전투 시작 시, `ATTACK_REQUEST_PACKET` 을 1초마다 전송합니다. 
  - 이때 Send 함수를 이벤트 큐에 post 하지 않습니다.

- **현재 구조가 이상한 것이지만, 1번의 경우 일관성이 깨집니다.**
  - 클라이언트의 UI, 네트워크가 결합되어 있습니다.
  - 이를 분리하여 코드 가독성과 유지보수성을 개선하고 위와 같은 오류 발생을 막습니다.

때문에 콘솔 입출력 로직과 패킷 송수신 로직의 분리가 필요합니다.