set root [file normalize [file join [file dirname [info script]] ..]]
set candidate [lindex $argv 0]
if {$candidate eq ""} {set candidate optimized}
set img $root/image/$candidate
open_hw_manager
connect_hw_server
set cables [get_hw_targets -quiet]
if {[llength $cables]!=1} {error "Expected one connected JTAG cable, found $cables"}
open_hw_target [lindex $cables 0]
set fpga [get_hw_devices -quiet xck26*]
if {[llength $fpga]!=1} {error "Expected one XCK26, found $fpga"}
current_hw_device $fpga
set_property PROGRAM.FILE $img/mesh.bit $fpga
set_property PROBES.FILE $img/mesh.ltx $fpga
program_hw_devices $fpga
refresh_hw_device $fpga
set vio [get_hw_vios -of_objects $fpga]
set ila [get_hw_ilas -of_objects $fpga]
if {[llength $vio]!=1 || [llength $ila]!=1} {error "Expected VIO and ILA; verify 25 MHz carrier clock"}
set ctl [get_hw_probes -of_objects $vio */console_probe_out0]
set status [get_hw_probes -of_objects $vio */core_status]
if {[llength $ctl]!=1 || [llength $status]!=1} {error "VIO probes missing: [get_hw_probes -of_objects $vio]"}
proc control {value} {
    global ctl
    set_property OUTPUT_VALUE [format %02x $value] $ctl
    commit_hw_vio $ctl
}
proc read_status {} {
    global vio status
    refresh_hw_vio $vio
    return [expr 0x[get_property INPUT_VALUE $status]]
}
control 0
after 100
set probe [get_hw_probes -of_objects $ila]
set_property CONTROL.TRIGGER_POSITION 128 $ila
set trigger "58'b10"
append trigger "010" "0000" "1" [string repeat X 48]
set_property TRIGGER_COMPARE_VALUE "eq$trigger" $probe
run_hw_ila $ila
control 1
for {set i 0} {$i<50} {incr i} {
    after 100
    set s [read_status]
    set verdict [expr {($s>>40)&255}]
    if {$s>>48 || $verdict>=0xe0} {error "PicoRV32 failed: status $s"}
    if {$verdict==0x52} break
}
if {$verdict!=0x52} {error "Firmware did not complete twice: status $s"}
set count [expr {($s>>8)&0xffffffff}]
set expected [open $root/mem/expected.mem r]
set observed {}
for {set i 0} {$i<16} {incr i} {
    control [expr {1+2*$i}]
    after 10
    set byte [expr {[read_status]&255}]
    if {[scan [gets $expected] %x gold]!=1 || $gold!=$byte} {error "Mismatch at output $i"}
    lappend observed [expr {$byte>=128 ? $byte-256 : $byte}]
}
close $expected
if {$count!=16944} {error "Unexpected hardware cycle count $count"}
wait_on_hw_ila -timeout 5 $ila
set data [upload_hw_ila_data $ila]
set folder $root/reports/$candidate
file mkdir $folder
write_hw_ila_data -force -csv_file $folder/stream.csv $data
set msg "PASS device=$fpga firmware_runs=2 cycles=$count outputs=$observed"
puts $msg
set out [open $folder/hardware.txt w]; puts $out $msg; close $out
