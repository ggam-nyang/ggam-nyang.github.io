---
emoji: 🌱
title: Spring Security login 구현
date: '2023-08-29 22:00:00'
author: 지구깜냥
tags: Kotlin Spring 개발자 Developer ValueClass
categories: Spring
---
> [Bottle-letter](https://github.com/HoYunBros/bottle-letter-be) 프로젝트 기록


Spring Security를 사용해 로그인을 구현하며 Filter를 이용한 방식과 Argument Resolver를 이용한 방식을 알아봤다.

### Filter를 이용한 로그인
먼저Spring Security의 동작 원리와 구조를 이해해보자.
https://spring.io/guides/topicals/spring-security-architecture/ 공식 레퍼런스에 잘 정리가 되어 있지만 간단히 설명을 해보자.

- 요청이 오면 Spring Security의 FilterChain이 가로챈다.
- Authentication 객체를 생성해서 security context에 저장하는데, 이 과정을 간략히 요약하자면
    - UsernamePasswordAuthenticationFilter 앞에 커스텀한 JwtFilter를 생성한다.
    - 커스텀 필터에서는 헤더의 jwt Token을 파싱하여 분석하고 인증한다.
    - Security에서 제공하는 `UserDetail, UserDetailService` 와 같은 인터페이스를 구현한다.
    - 인증된 유저는 Authentication 객체로 Security Context에 저장된다.

위 내용 말고도, Security가 제공하는 기능은 너무 많지만 나는 위와 같은 방식으로 인증을 구현했다.

장점
- 모든 API에 대해 공통 인증을 할 수 있다
- 대규모 환경에서 인증 로직을 일괄 처리할 수 있다

단점
- 구현 코드의 양이 많다
- 복잡한 작동 방식을 이해해야 한다 -> 인증 구현과 테스트 작성에 어려움이 있다

정도로 정리할 수 있다.

```kotlin
@Component  
class JwtFilter(  
    private val jwtUtils: JwtUtils  
) : OncePerRequestFilter() {  
  
    override fun doFilterInternal(  
        request: HttpServletRequest,  
        response: HttpServletResponse,  
        filterChain: FilterChain  
    ) {  
        val authorizationHeader: String = request.getHeader("Authorization") ?: return filterChain.doFilter(  
            request,  
            response  
        )  
  
        if (authorizationHeader.length < "Bearer ".length) {  
            return filterChain.doFilter(request, response)  
        }        val token = authorizationHeader.substring("Bearer ".length)  
  
        // validate token  
        if (jwtUtils.validation(token)) {  
            val username = jwtUtils.parseUsername(token)  
            val authentication: Authentication = jwtUtils.getAuthentication(username)  
  
            SecurityContextHolder.getContext().authentication = authentication  
        }  
  
        filterChain.doFilter(request, response)  
    }}

// 외에도 JwtFilter, UserDetail, UserService 등 구현해야 할게 많다.
```

### Argument Resolver를 이용한 로그인
`ArgumentResolver`는 어떠한 요청이 컨트롤러에 들어왔을 때, 요청에 들어온 값으로부터 원하는 객체를 만들어내는 일을  간접적으로 해줄 수 있다.

결과를 먼저 보자면

```kotlin
@GetMapping("/me")  
fun getMe(  
    @LoginUser user: User  
): ResponseEntity<ApiResponse<UserResponse>> {  
    val response = userService.getMe(user.id)  
    return ResponseEntity.ok(ApiResponse.success(response))  
}
```
`@LoginUser`는 커스텀 어노테이션이다. 이 어노테이션이 붙은 파라미터가 어떻게 처리될까?

```kotlin
@Component  
class LoginUserResolver(  
    private val jwtTokenProvider: JwtTokenProvider,  
    private val userService: UserService  
) : HandlerMethodArgumentResolver {  
    override fun supportsParameter(parameter: MethodParameter): Boolean {  
        return parameter.hasParameterAnnotation(LoginUser::class.java)  
    }  
    override fun resolveArgument(  
        parameter: MethodParameter,  
        mavContainer: ModelAndViewContainer?,  
        webRequest: NativeWebRequest,  
        binderFactory: WebDataBinderFactory?  
    ): User {  
        // ... jwt 토큰 검증 
    }  
}
```
`HandlerMethodArgumentResolver`를 확장했고, 이를 위해 두개의 함수를 override했다.
`supportsParameter`는 해당 파라미터가 @LoginUser 어노테이션을 가지고 있는지 확인한다.
이 값이 true라면, `resolveArguement`가 실행되고, 이 과정에서 우리가 원하는 jwt 인증을 할 수 있다.

우리가 평소 Controller 계층에서 HttpRequest, @RequestParam, @RequestBody 등 여러가지 타입의 파라미터를 사용할 수 있는 것은 이때문이다.

장점
- 코드가 간결해진다
- jwt 로직을 컨트롤러와 분리할 수 있다.
- 구현이 상대적으로 간편하다

단점
- 인증이 필요한 모든 API에 대해 적용해야한다 -> 일관성이 떨어진다
- Spring Security의 일부 기능들과 통합이 복잡해질 수 있다.