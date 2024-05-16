---
emoji: ✏️
title: Boost Work란?
date: '2024-03-23 22:00:00'
author: 지구깜냥
tags: c++ cpp boost LobbyServer
categories: C++ Boost
---

## Boost asio::io_service::work 란?
Boost asio를 사용해 소켓 서버를 생성하면, 항상 io_service(지금은 io_context로 대체)를 사용하게 된다.  
[링크](https://stackoverflow.com/questions/17156541/why-do-we-need-to-use-boostasioio-servicework)에선 work를 사용해야 하는 이유를 다루고 있다.

```c++
int main()
{
    boost::asio::io_service srv;
    boost::asio::io_service::work work(srv);
    boost::thread_group thr_grp;
    thr_grp.create_thread(boost::bind(&boost::asio::io_service::run, &srv));
    thr_grp.create_thread(boost::bind(&boost::asio::io_service::run, &srv));

    srv.post(boost::bind(f1, 123));
    srv.post(boost::bind(f1, 321));
    //sync

    srv.post(boost::bind(f2, 456));
    srv.post(boost::bind(f2, 654));
    //sync

    srv.stop();
    thr_grp.join();
}
```

```c++
int main()
{
    boost::asio::io_service srv;
    //boost::asio::io_service::work work(srv);
    std::vector<boost::thread> thr_grp;

    srv.post(boost::bind(f1, 123));
    srv.post(boost::bind(f1, 321));
    //sync

    srv.post(boost::bind(f2, 456));
    srv.post(boost::bind(f2, 654));
    //sync

    // What is the difference between the poll and run, when io_service without work?
    thr_grp.emplace_back(boost::bind(&boost::asio::io_service::poll, &srv));// poll or run?
    thr_grp.emplace_back(boost::bind(&boost::asio::io_service::run, &srv));// poll or run? 

    srv.stop();
    for(auto &i : thr_grp) i.join();

    int b;
    std::cin >> b;

    return 0;
}
```

두 코드를 보면, 1. thread 생성, 2. 작업 post,  두 개의 작업이 존재하고
1번 코드는 1 → 2 (work 객체와 함께)
2번 코드는 2 → 1 의 순서로 코드 흐름이 이어진다.

post는 IO Execution Context(여기선 io_service)에서 실행하겠다는 의미이다.
모든 context는 run을 실행해줘야 하는데, 여기선 thread를 생성하고 `io_service::run` 작업을 실행한다.

즉, 1번 코드는 IO Context run 이후 post
2번 코드는 post 이후 IO Context를 run 한다.

**즉, 남은 작업이 존재하지 않아도 io_service가 run을 반환하지 않도록 도와주는 것이 work의 역할이다.**

ps. Deprecated 된 work 대신 [executor_work_guard](https://chelseafandev.github.io/2022/01/11/prevent-io-context-run-from-returning/) 를 사용한다.