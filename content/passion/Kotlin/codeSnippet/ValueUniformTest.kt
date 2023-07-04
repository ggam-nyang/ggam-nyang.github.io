package study

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

@JvmInline
value class Uniform(private val number: Int) {
    init {
        require(number in 0..20)
    }
}

@Test
fun test4() {
    val uniform1 = Uniform(1)
    val uniform2 = Uniform(1)

    assertThat(uniform1 == uniform2).isTrue
//        assertThat(uniform1 === uniform2).isTrue // value class는 동등성 비교는 불가하다.
}