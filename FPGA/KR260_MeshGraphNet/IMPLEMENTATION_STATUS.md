# KR260 implementation status

| Milestone | Evidence |
|---|---|
| Functional design | PASS in XSim for both candidates. RV32I firmware ran twice, checked all 16 values, and recovered after reset. Seven injected stall cycles produced 16,951 cycles. The unstalled run took 16,944 cycles. |
| FPGA implementation | PASS in Vivado 2026.1 BASIC targeting xck26-sfvc784-2LV-c. At 100 MHz, WNS +4.612 ns, WHS +0.015 ns, zero unclocked registers and zero unconstrained internal endpoints. Bitstream DRC reported zero errors. Resources are 2,356 CLB LUTs, 3,062 CLB registers, 10 BRAM tiles and 1 DSP48E2. |
| Hardware demonstration | PASS on physical XCK26 via JTAG. The PicoRV32 firmware completed two runs and checked 16 outputs per run. VIO readback independently matched all 16 values. The accelerator counted 16,944 cycles. An ILA message window is archived in reports/optimized/stream.csv. |
| Power | Both RTL candidates passed and generated active and idle SAIF. Routed optimized estimate is 116 mW active and 115 mW idle for whole-design dynamic power. About 6% of routed nets matched SAIF, with vectorless propagation for the remainder. Estimated incremental energy is approximately 0.17 µJ at the report resolution. Routed baseline comparison is in progress. |

Eight signed bits with five fractional bits use a scale of 1/32. Relative to the INT8 golden, 4, 5, 6 and 7 bits have maximum output errors of 43, 26, 15 and 16 INT8 LSB at the same real range. Eight bits is the smallest tested precision with exact agreement for this workload. The graph has 80 input bytes. Feature RAM is 1,024 × 16 bits, firmware RAM is 1,024 × 32 bits, schedule with embedded weights is 5,648 × 28 bits, and output is 16 bytes. At 100 MHz the accelerator latency is 169.44 µs, excluding firmware command and readback.

The project uses the carrier clock and runs in PL with PicoRV32 native MMIO. PS configuration and an AXI bridge are outside this implementation.

XSim collected statement, branch and toggle diagnostic databases. xcrg export is blocked by the installed BASIC license, which requires PRO for the reporter.
