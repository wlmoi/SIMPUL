`timescale 1ns/1ps
module power_tb;
`ifdef BASELINE
localparam OPT=0;
`else
localparam OPT=1;
`endif
reg clk=0, resetn=0;
always #5 clk=!clk;
initial begin repeat(5) @(negedge clk); resetn=1; end
wire busy,done,trap;
wire [7:0] verdict, result_byte;
wire [31:0] cycles;
wire [2:0] stage;
wire [3:0] entity;
wire commit;
wire signed [15:0] feature;
wire [1:0] phase;
mesh_soc #(.OPT(OPT)) dut(clk, resetn, 1'b1, 4'b0, result_byte, verdict, trap,
    cycles,busy,done,stage,entity,commit,feature,phase);
endmodule
