# KR260 implementation status

| Milestone | Status and evidence |
|---|---|
| Functional design | PASS. XSim ran compiled PicoRV32 RV32I firmware for both candidates. The test recovered from reset during an inference, verified two complete runs and compared all 16 outputs against Python. Seven injected stall cycles gave 16,951 cycles. The unstalled run took 16,944 cycles. |
| FPGA implementation | PASS. Both XCK26 images meet timing at 100 MHz and completed bitstream DRC with zero errors. Both have zero unclocked registers and zero unconstrained internal endpoints. |
| Hardware demonstration | PASS. Both images ran twice on physical XCK26. JTAG VIO independently read all 16 bytes and the accelerator cycle count. ILA captured the first message commit for edge 0 at busy cycle 2,574. The clock-enable image was restored after testing. |
| Power comparison | PASS for preliminary Vivado estimates. Incremental energy is tied at printed resolution. The clock-enable candidate is the default because it reduces estimated active dynamic power at the same observed latency. |
| Handoff | PASS. Portable launcher, Windows shortcut, firmware, bitstreams, testbenches, ILA captures and reports are available. |

Vivado 2026.1 BASIC targeted xck26-sfvc784-2LV-c with the KR260 SOM 2.0 board definition. The 100 MHz design uses the carrier clock, PicoRV32 native MMIO and JTAG VIO/ILA in PL. This implementation has no PS control or AXI bridge.

| Metric | Continuous-read baseline | Clock enable |
|---|---:|---:|
| Post-route WNS | +3.823 ns | +4.612 ns |
| Post-route WHS | +0.013 ns | +0.015 ns |
| CLB LUTs | 2,358 | 2,356 |
| CLB registers | 3,062 | 3,062 |
| BRAM tiles | 10 | 10 |
| DSP48E2 | 1 | 1 |
| Physical inference cycles | 16,944 | 16,944 |
| Accelerator latency at 100 MHz | 169.44 µs | 169.44 µs |
| Max output error versus integer golden | 0 LSB | 0 LSB |
| Active on-chip dynamic, estimated | 118 mW | 116 mW |
| Idle on-chip dynamic, estimated | 117 mW | 115 mW |
| Active total on-chip power, estimated | 407 mW | 405 mW |
| Active SoC hierarchy dynamic, estimated | 11 mW | 9 mW |
| Incremental energy per inference, estimated | ≈0.17 µJ | ≈0.17 µJ |

Vivado matched 369 of 6,598 routed nets for baseline and 369 of 6,607 for clock enable, roughly 6% in both activity windows. Remaining activity used probabilistic propagation. Some RTL CPU signals contain don't-care X values. The estimated active whole-design dynamic reduction is 1.7%. Incremental energy uses the printed active-minus-idle delta of 1 mW and 169.44 µs. Milliwatt report resolution and limited annotation preclude a reliable conclusion about incremental energy savings. Board power was not measured.

From the generated schedule, the clock-enable candidate issues 5,648 ROM reads and 5,184 feature reads across 16,944 busy cycles. This reduces reads by 66.7% and 69.4% respectively versus continuous reads. Both execute 464 feature stores.

Signed INT8 with five fractional bits represents −4 to 3.96875 at scale 1/32. Relative to the INT8 golden, the maximum output errors at 4, 5, 6 and 7 bits are 43, 26, 15 and 16 INT8 LSB respectively. INT8 is the smallest tested width that exactly preserves this workload. Feature RAM is 1,024 × 16 bits, firmware RAM is 1,024 × 32 bits, schedule with embedded weights is 5,648 × 28 bits, graph input is 80 bytes, and the output buffer is 16 bytes. The RV32I firmware payload is 244 bytes and the default bitstream is 7,797,905 bytes.

XSim collected statement, branch and toggle diagnostic databases. The BASIC license prevents xcrg report export. SIMPUL regression checks passed 18 JavaScript suites, the module catalog, the standalone build and three standalone pytest cases. API registry pytest collection was blocked by the missing FastAPI dependency in the local Python environment.
