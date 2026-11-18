`timescale 1ns/1ps
module tb;
parameter OPT=1;
reg clk=0, resetn=0, advance=1;
always #5 clk=!clk;
wire busy,done,trap,commit;
wire [31:0] cycles;
wire [7:0] verdict, val;
wire [2:0] stage;
wire [3:0] entity;
wire [1:0] phase;
wire signed [15:0] feature;
reg [3:0] idx=0;
mesh_soc #(.OPT(OPT)) dut(clk,resetn,advance,idx,val,verdict,trap,cycles,busy,done,stage,entity,commit,feature,phase);
reg [7:0] gold [0:15];
integer outputs=0, runs=0, stalls=0, i;
reg prev_done=0;
always @(posedge clk) begin
    prev_done<=done;
    if(resetn && trap) $fatal(1,"CPU trap");
    if(commit && stage==5) begin
        if(feature[7:0] !== gold[outputs%16]) $fatal(1,"decoder mismatch %0d",outputs);
        outputs=outputs+1;
    end
    if(busy && !advance) stalls=stalls+1;
    if(done && !prev_done) begin
        if(cycles !== 16944+stalls) $fatal(1,"unexpected cycles %0d",cycles);
        $display("inference %0d cycles=%0d stalls=%0d",runs+1,cycles,stalls);
        stalls=0; runs=runs+1;
    end
end
initial begin
    $readmemh("expected.mem",gold);
    if(dut.accelerator.quant(10000,0)!==8'd127 || dut.accelerator.quant(-10000,0)!==8'h80 ||
       dut.accelerator.quant(-17,0)!==8'hff || dut.accelerator.quant(-16,0)!==0)
       $fatal(1,"quantization");
    repeat(5) @(negedge clk); resetn=1;
    wait(busy); repeat(20) @(negedge clk); resetn=0;
    repeat(4) @(negedge clk); resetn=1;
    wait(busy); repeat(15) @(negedge clk); advance=0;
    repeat(7) @(negedge clk); advance=1;
    wait(verdict==8'h52); @(negedge clk);
    if(outputs!=32 || runs!=2) $fatal(1,"missing output");
    for(i=0;i<16;i=i+1) begin idx=i; #1; if(val!==gold[i]) $fatal(1,"readback"); end
    $display("PASS PicoRV32 two complete graphs, reset recovery, stalls, saturation, golden readback");
    $finish;
end
initial begin #1000000; $fatal(1,"timeout"); end
endmodule

module tb_baseline; tb #(.OPT(0)) test(); endmodule
