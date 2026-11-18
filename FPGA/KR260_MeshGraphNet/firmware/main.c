#include "expected.h"
typedef unsigned int u32;
#define IO (*(volatile u32 *)0x10000000)
#define REG(i) (((volatile u32 *)0x10000000)[i])
void main(void) {
    for (int pass = 0; pass < 2; ++pass) {
        IO = 1;
        while (!(IO & 2)) {}
        for (unsigned i = 0; i < 16; ++i) {
            if ((signed char)REG(16+i) != expected[i]) {
                REG(2) = 0xe0+i;
                for (;;) {}
            }
        }
        REG(2) = 0x51 + pass;
    }
    for (;;) {}
}
