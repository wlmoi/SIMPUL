source [file join [file dirname [info script]] create_project.tcl]
set_param general.maxThreads 2
set reports [file join $root reports $candidate]
file mkdir $reports
launch_runs synth_1 -jobs 1
wait_on_run synth_1
if {[get_property PROGRESS [get_runs synth_1]] ne "100%"} {error "Synthesis failed"}
launch_runs impl_1 -to_step write_bitstream -jobs 1
wait_on_run impl_1
if {[get_property PROGRESS [get_runs impl_1]] ne "100%"} {error "Implementation failed"}
open_run impl_1
report_timing_summary -report_unconstrained -file $reports/timing.rpt
report_utilization -file $reports/utilization.rpt
report_drc -file $reports/drc.rpt
check_timing -verbose -file $reports/check_timing.rpt
report_power -file $reports/vectorless_power.rpt
foreach type {min max} {
    set path [get_timing_paths -delay_type $type -max_paths 1]
    if {![llength $path] || [get_property SLACK $path]<0} {error "Timing failure ($type)"}
}
file mkdir $root/image/$candidate
file copy -force [get_property DIRECTORY [get_runs impl_1]]/fabric_wrapper.bit $root/image/$candidate/mesh.bit
write_debug_probes -force $root/image/$candidate/mesh.ltx
