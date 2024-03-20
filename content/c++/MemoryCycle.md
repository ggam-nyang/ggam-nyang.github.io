---
emoji: ✏️
title: 메모리 사이클 관리
date: '2024-03-19 22:00:00'
author: 지구깜냥
tags: c++ cpp memory shared_ptr LobbyServer
categories: C++
---
## 메모리 사이클
기존 코드를 보면 아래와 같습니다.
```c++
void Client::Send() {
  ProtocolPtr temp;
  cout << "닉네임을 입력해주세요." <<endl;
  cout << "nickname." <<endl;
  isSetId = true;
  getline(std::cin, writeBuffer_);
  temp = Protocol::create(ProtocolType::SET_ID, writeBuffer_);

  sock.async_write_some(
      asio::buffer(temp->encode()),
      [this](const system::error_code& ec, size_t) { SendHandle(ec); });
}
```
ProtocolPtr은 패킷을 주고 받을 때 사용하는 encode, decode가 구현된 객체입니다.
여기서 temp 변수는 Send() 함수에서 선언한 지역 변수이고, Send() 함수의 종료와 함께 소멸됩니다.

Send() 함수는 비동기 함수인 boost::asio::async_write_some()을 호출합니다.  
이때 Send() 함수가 종료된 이후 비동기 함수가 실행되고, 실행 후 SendHandle() 함수가 호출됩니다.  

문제는 **여기서** 발생할 수 있습니다.  
비동기함수는 temp->encode()를 매개변수로 전달받는데, temp는 Send() 함수가 종료되면 소멸됩니다.
Send()의 종료 이후, 비동기함수가 실행될 때 temp의 메모리 안정성은 보장되지 않습니다.  
때문에 메모리 이슈가 발생할 수 있고, 우리는 이 메모리를 관리해줄 필요가 있습니다.


### 람다에 캡쳐
비동기 함수에서 temp를 사용하기 위해 람다에 캡쳐를 사용합니다.
```c++
void Client::Send() {
 ... 중략
  sock.async_write_some(
      asio::buffer(temp->encode()),
      [this, temp](const system::error_code& ec, size_t) { SendHandle(ec, temp); });
}
```

위와 같이 핸들러 함수에 temp를 캡쳐하여 전달하면, temp 지역 변수는 SendHandle() 함수 종료까지 메모리가 유지됩니다.
때문에 발생할 수 있는 메모리 이슈를 방지할 수 있습니다.

### 명시적 메모리 관리
그러나 캡쳐 방식은 메모리 관리가 명시적이지 않습니다. 람다의 문법도 그렇고, 캡쳐된 변수의 메모리 사이클은 암시적으로 나타납니다.

c++은 메모리 관리가 중요한 언어이기 때문에, 명시적으로 메모리 사이클을 나타내는 코드가 중요할 수 있습니다.

```c++
void Client::Send() {
  ProtocolPtr temp;
  bufferContainer_.push_back(temp); // 1) temp를 컨테이너에 추가
  bufferContainer_.push_back(buffer(temp->encode())) // 또는 2) buffer를 저장 (이게 더 좋은 방식인듯..?)
  
    
    ... 중략
  sock.async_write_some(
      asio::buffer(temp->encode()),
      [this](const system::error_code& ec, size_t) { SendHandle(ec, temp); });
}

// SendHandle()에서 명시적으로 bufferContainer_에서 temp를 삭제합니다.
```
위와 같이 container에 사용할 buffer를 담아서 명시적으로 메모리 사이클을 관리할 수 있습니다.  
이렇게 할 경우, buffer가 언제 저장되고 언제 삭제되는지 명시적으로 알 수 있습니다.


### shared_ptr 사용
기존에는 `using unique_ptr<Protocol> ProtocolPtr`을 사용했었습니다.  
unique_ptr은 한 객체만 소유권이 있고, 소유권을 단 하나의 객체에게 보장할 수 있습니다.

Send()의 지역변수로 Protocol 객체를 생성하는 경우, unique_ptr의 사용이 문제가 발생하진 않지만 좋은 활용은 아니라고 생각합니다.  
예를 들어, Send()에서 broadcast를 호출할 경우, Protocol 객체가 여러개가 될 수 있고, 소유권이 필요한 객체가 여러개가 될 수 있습니다.  
이 경우에는 unique_ptr보다 shared_ptr로 관리하는 것이 효율적입니다.  

뿐만 아니라 unique_ptr은 기능을 떠나 사용자의 의도를 나타냅니다. 그러나 이 경우 레퍼런스 카운트가 꼭 1이 되어야만 하는 의도는 없었습니다.  
때문에 일반적으로 사용하기 좋은 shared_ptr로 변경했습니다.




