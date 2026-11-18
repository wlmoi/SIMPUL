# KR260 carrier 2.0 HPA_CLK0P_CLK -> SOM240_1_A6 -> package C3.
set_property -dict {PACKAGE_PIN C3 IOSTANDARD LVCMOS18} [get_ports refclk]
# clk_wiz emits the primary 25 MHz constraint and generated clock.
