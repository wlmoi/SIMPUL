.section .text.start
.globl _start
_start:
 li sp,4096
 call main
1: j 1b
