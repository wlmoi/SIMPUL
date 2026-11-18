set root [file normalize [file join [file dirname [info script]] ..]]
set candidate [lindex $argv 0]
open_project $root/build/$candidate/mesh.xpr
open_run impl_1
set cells [get_cells -hier -filter {NAME =~ */soc}]
if {[llength $cells]!=1} {error "SoC mapping ambiguous: $cells"}
set hierarchy [split [get_property NAME $cells] /]
set dest $root/reports/$candidate
set activity $root/build/activity_$candidate
foreach window {idle active} {
    reset_switching_activity -all
    set source [open $activity/$window.saif r]
    set data [read $source]
    close $source
    set path ""
    foreach instance $hierarchy {append path "(INSTANCE $instance\n"}
    if {![regsub {\(INSTANCE\s+dut\s+} $data $path data]} {error "SAIF DUT missing"}
    append data [string repeat ) [expr {[llength $hierarchy]-1}]]
    set mapped [open $activity/${window}_mapped.saif w]
    puts $mapped $data
    close $mapped
    read_saif -strip_path power_tb -out_file $dest/mapping_$window.rpt $activity/${window}_mapped.saif
    report_power -hier all -hierarchical_depth 0 -file $dest/power_$window.rpt
}
