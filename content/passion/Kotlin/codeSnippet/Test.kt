package study

import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test
import javax.print.attribute.IntegerSyntax

class Test() {

    @Test
    fun test1() {
        val number1 = 1
        val number2 = 1

        assertThat(number1).isEqualTo(number2)
        assertThat(number1).isSameAs(number2)
    }

    @Test
    fun test11() {
        val number1 = 1
        val number2 = 1

        assertThat(number1).isEqualTo(number2)
        assertThat(number1).isSameAs(number2)
    }

    @Test
    fun test2() {
        val number1 = 1000
        val number2 = 1000

        assertThat(number1).isEqualTo(number2)
        assertThat(number1).isSameAs(number2)
    }

    @Test
    fun test3() {
        val number1 = Integer.valueOf(1)
        val number2 = Integer.valueOf(1)

        assertThat(number1 == number2).isTrue
        assertThat(number1 === number2).isTrue
    }

    class Uniform(val number: Int) {

        companion object {
            private const val MIN_NUMBER = 0
            private const val MAX_NUMBER = 20

            private val uniformMap = (MIN_NUMBER..MAX_NUMBER).associateWith { Uniform(it) }

            fun of(number: Int): Uniform = uniformMap[number] ?: Uniform(number)
        }
    }

    @JvmInline
    value class Uniform1(val number: Int) {

        companion object {
            private const val MIN_NUMBER = 0
            private const val MAX_NUMBER = 20

            private val uniformMap = (MIN_NUMBER..MAX_NUMBER).associateWith { Uniform(it) }

            fun of(number: Int): Uniform = uniformMap[number] ?: Uniform(number)
        }
    }


}