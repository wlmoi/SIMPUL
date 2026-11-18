set root [file normalize [file join [file dirname [info script]] ..]]
set candidate [lindex $argv 0]
if {$candidate eq ""} {set candidate optimized}
if {$candidate ni {baseline optimized}} {error "unknown candidate"}
set work [file join $root build $candidate]
create_project mesh $work -part xck26-sfvc784-2LV-c -force
set_property board_part xilinx.com:kr260_som:part0:2.0 [current_project]
set optimized_cache $root/build/optimized/mesh.cache/ip
if {$candidate eq "baseline" && [file isdirectory $optimized_cache]} {
    config_ip_cache -use_cache_location $optimized_cache
}
add_files [concat [glob $root/rtl/*/*.v] [glob $root/mem/*.mem]]
add_files -fileset constrs_1 $root/vivado/constraints/kr260.xdc
create_bd_design fabric
proc ip {name kind} {
    create_bd_cell -type ip -vlnv [lindex [get_ipdefs -all -filter "NAME == $kind"] end] $name
}
ip pl_clock clk_wiz
set_property -dict [list CONFIG.PRIM_IN_FREQ 25.000 CONFIG.CLKOUT1_REQUESTED_OUT_FREQ 100.000 CONFIG.USE_RESET false] [get_bd_cells pl_clock]
create_bd_port -dir I -type clk -freq_hz 25000000 refclk
connect_bd_net [get_bd_ports refclk] [get_bd_pins pl_clock/clk_in1]
create_bd_cell -type module -reference board_core core
set_property CONFIG.OPT [expr {$candidate eq "optimized"}] [get_bd_cells core]
ip console vio
set_property -dict [list CONFIG.C_NUM_PROBE_IN 1 CONFIG.C_NUM_PROBE_OUT 1 CONFIG.C_PROBE_IN0_WIDTH 49 CONFIG.C_PROBE_OUT0_WIDTH 5] [get_bd_cells console]
ip stream ila
set_property -dict [list CONFIG.C_MONITOR_TYPE Native CONFIG.C_NUM_OF_PROBES 1 CONFIG.C_PROBE0_WIDTH 58 CONFIG.C_DATA_DEPTH 1024] [get_bd_cells stream]
connect_bd_net [get_bd_pins pl_clock/clk_out1] [get_bd_pins core/clk] [get_bd_pins console/clk] [get_bd_pins stream/clk]
connect_bd_net [get_bd_pins pl_clock/locked] [get_bd_pins core/locked]
connect_bd_net [get_bd_pins console/probe_out0] [get_bd_pins core/control]
connect_bd_net [get_bd_pins core/status] [get_bd_pins console/probe_in0]
connect_bd_net [get_bd_pins core/trace] [get_bd_pins stream/probe0]
validate_bd_design
save_bd_design
set bd [get_files fabric.bd]
set_property synth_checkpoint_mode Hierarchical $bd
generate_target all $bd
add_files [make_wrapper -files $bd -top]
set_property top fabric_wrapper [current_fileset]
update_compile_order -fileset sources_1
