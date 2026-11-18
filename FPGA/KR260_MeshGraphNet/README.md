# KR260 MeshGraphNet

This fixed laboratory workload runs 8 nodes, 16 directed edges, 4 node inputs, 3 edge inputs, 8 hidden features, one message-passing stage, and 2 outputs per node on the AMD Kria KR260. A PicoRV32 runs RV32I firmware and controls the accelerator through its native MMIO bus at `0x10000000`. The PL clock comes from the carrier's 25 MHz HPA_CLK0P_CLK at C3 and a 100 MHz Clocking Wizard.

Connect power and USB JTAG, then double-click `RUN_FPGA.cmd`. It builds the image if needed, programs volatile PL configuration, releases the CPU, and checks the two firmware inference runs. The demo reads all decoded bytes with JTAG VIO and exports an ILA capture.

Run from this directory with Python 3 and Vivado 2026.1. Set `AMD_ROOT` to the versioned AMD install directory if different from `D:\AMD\2026.1`.

```powershell
python demo/run_demo.py firmware
python demo/run_demo.py sim
python demo/run_demo.py build
python demo/run_demo.py run
python demo/run_demo.py sim --candidate baseline
python demo/run_demo.py build --candidate baseline
python demo/activity.py optimized
python demo/activity.py baseline
```

The GUI project is `build/optimized/mesh.xpr`. Vivado evidence goes to `reports/<candidate>/`, and timing-accepted FPGA images go to `image/<candidate>/`. Firmware regeneration updates the BRAM images. Rebuild before programming when those change.

The reference simplifies the PhysicsNeMo MLPs and normalization to single linear projections and ReLU with a linear decoder. Its graph and weights are deterministic and synthetic. Both builds share a single scalar MAC. The baseline reads memories continuously. The optimized candidate enables instruction ROM on fetch and feature BRAM on MAC reads. For estimated incremental energy per inference, use the same routed power boundary for active and idle and multiply their dynamic power difference by 169.44 µs.

- [Implementation status](IMPLEMENTATION_STATUS.md)
- [Data flow and cycle schedule](demo/explain_dataflow.md)
- [PhysicsNeMo MeshGraphNet e676589](https://github.com/NVIDIA/physicsnemo/tree/e676589dac80a1dbd319d2f2817d703c2cf4f059/physicsnemo/models/meshgraphnet)
- [PicoRV32 ef203c2](https://github.com/YosysHQ/picorv32/tree/ef203c2b0a3fb793280f5114941416c425c5b461)
- [AMD KR260 user guide](https://docs.amd.com/r/en-US/ug1092-kr260-starter-kit)
- [AMD Vivado power analysis](https://docs.amd.com/r/en-US/ug907-vivado-power-analysis-optimization)
