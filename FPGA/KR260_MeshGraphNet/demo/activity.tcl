proc await_busy {} {
    for {set n 0} {$n<3000} {incr n} {
        run 10 ns
        if {[get_value /power_tb/busy] eq "1"} {return}
    }
    error "no firmware start"
}
proc capture {name cycles} {
    open_saif ${name}.saif
    set nets {}
    foreach net [get_objects -r /power_tb/dut/*] {
        if {![regexp {/(schedule|features|ram|cpuregs|outputs)(\[|$)} $net]} {lappend nets $net}
    }
    log_saif $nets
    run [expr {$cycles*10}] ns
    close_saif
}
await_busy
foreach {stage clocks} {node_encode 960 edge_encode 1536 message 9984 aggregate 576 update 3456 decode 432} {
    capture $stage $clocks
}
if {[get_value /power_tb/done] ne "1"} {error "first run incomplete"}
restart
await_busy
capture active 16944
run 200 us
if {[get_value -radix unsigned /power_tb/verdict] != 82} {error "firmware verdict"}
capture idle 16944
puts "SAIF_PASS"
quit
