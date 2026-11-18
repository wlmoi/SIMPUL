ENTRY(_start)
SECTIONS {
 . = 0;
 .text : { *(.text.start) *(.text*) }
 .rodata : { *(.rodata*) *(.srodata*) }
 .data : { *(.data*) }
 .bss : { *(.bss*) }
}
