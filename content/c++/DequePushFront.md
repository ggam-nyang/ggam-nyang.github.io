---
emoji: ✏️
title: C++: Deque push_front는 O(1)일까?
date: '2024-01-30 22:00:00'
author: 지구깜냥
tags: c++ cpp deque data-structure
categories: c++
---

# deque의 push_front 시간복잡도

list는 Node로 구성되어, 삽입 삭제에 유리하지만 operator [] 를 사용할 수 없다.
vector는 데이터가 선형으로 이어져야 하기 때문에 삽입/삭제 시 불리하지만, operator []가 가능하다.
c++ 표준 라이브러리가 제공하는 Deque는 이 둘을 섞은 느낌이다.
Deque는 block의 형태로 구현되어 있다.

```cpp
_NODISCARD const_reference operator[](size_type _Pos) const noexcept /* strengthened */ {
#if _CONTAINER_DEBUG_LEVEL > 0
        _STL_VERIFY(_Pos < _Mysize(), "deque subscript out of range");
#endif // _CONTAINER_DEBUG_LEVEL > 0

        return *(_Unchecked_begin() + static_cast<difference_type>(_Pos));
    }

_NODISCARD reference operator*() const noexcept {
    _Size_type _Block = _Mycont->_Getblock(_Myoff);
    _Size_type _Off   = _Myoff % _Block_size;
    return _Mycont->_Map[_Block][_Off];
}
```

operator [], *를 보면 Block과 Map이 나온다.
Deque는 내부적으로 block으로 이루어져 있다. 이 block이 하나의 vector(배열)이고, 이 block들이 여러개로 구성되어 있다.
때문에 원소의 삽입,삭제는 빠르게 이루어진다. vector처럼 원소를 재정렬할 필요가 없기 때문이다.
또 vector와 같이 []도 사용가능하다.

여기서 의문이 생겼는데, push_front를 실행할 경우, 새로운 block이 필요할 수 있다.
이 경우 새로운 block을 어떻게 관리하면 시간복잡도가 O(1)일 수 있을까 궁금했다.

위 operator*를 보면, `_Map[_Block][_Off]` 를 통해 원소를 가져온다.
block들을 map으로 관리하고, 이 block에 접근하여 offset에 해당하는 원소를 가져온다.

push_front()를 보자

```cpp
template <class... _Tys>
void _Emplace_front_internal(_Tys&&... _Vals) {
    if (_Myoff() % _Block_size == 0 && _Mapsize() <= (_Mysize() + _Block_size) / _Block_size) {
        _Growmap(1);
    }
... 중략

void _Growmap(size_type _Count) { // grow map by at least _Count pointers, _Mapsize() a power of 2
    static_assert(_Minimum_map_size > 1, "The _Xlen() test should always be performed.");

    _Alpty _Almap(_Getal());
    size_type _Newsize = _Mapsize() > 0 ? _Mapsize() : 1;
    while (_Newsize - _Mapsize() < _Count || _Newsize < _Minimum_map_size) {
        // scale _Newsize to 2^N >= _Mapsize() + _Count
        if (max_size() / _Block_size - _Newsize < _Newsize) {
            _Xlen(); // result too long
        }

        _Newsize *= 2;
    }

    size_type _Myboff = _Myoff() / _Block_size;
    _Mapptr _Newmap   = _Allocate_at_least_helper(_Almap, _Newsize);
    _Mapptr _Myptr    = _Newmap + _Myboff;

    _Count = _Newsize - _Mapsize();

    _Myptr = _STD uninitialized_copy(_Map() + _Myboff, _Map() + _Mapsize(), _Myptr); // copy initial to end
    if (_Myboff <= _Count) { // increment greater than offset of initial block
        _Myptr = _STD uninitialized_copy(_Map(), _Map() + _Myboff, _Myptr); // copy rest of old
        _Uninitialized_value_construct_n_unchecked1(_Myptr, _Count - _Myboff); // clear suffix of new
        _Uninitialized_value_construct_n_unchecked1(_Newmap, _Myboff); // clear prefix of new
    } else { // increment not greater than offset of initial block
        _STD uninitialized_copy(_Map(), _Map() + _Count, _Myptr); // copy more old
        _Myptr = _STD uninitialized_copy(_Map() + _Count, _Map() + _Myboff, _Newmap); // copy rest of old
        _Uninitialized_value_construct_n_unchecked1(_Myptr, _Count); // clear rest to initial block
    }

    if (_Map() != nullptr) {
        _Destroy_range(_Map(), _Map() + _Mapsize());
        _Almap.deallocate(_Map(), _Mapsize()); // free storage for old
    }

    _Map() = _Newmap; // point at new
    _Mapsize() += _Count;
}
```

새로운 block이 필요한 경우 Growmap을 호출한다.
이 함수의 흐름은

1. 새로운 맵 크기 계산(2배씩 늘려감)
2. 새로운 맵에 기존 맵 복사
3. 복사되지 않은 영역은 초기화
4. 기존 맵 메모리 해제
   Map의 크기가 부족하다면, `newSize` 를 2배한다.
5. deque의 map, mapSize 등을 수정

여기서 새로운 기존 맵 복사를 보면, push_front 상황이라면 기존 map을 전부 복사해야 하므로, 시간복잡도가 O(n)이 된다!!

때문에 push_front의 시간복잡도는 새로운 block이 생길 경우에는, O(n)이다.



