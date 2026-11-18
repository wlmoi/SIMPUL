module board_core #(parameter OPT=1)(
    input clk, locked, input [4:0] control,
    output [48:0] status, output [57:0] trace
);
    reg [1:0] rstpipe=0;
    always @(posedge clk) rstpipe<={rstpipe[0],locked && control[0]};
    wire [31:0] cycles;
    wire [7:0] selected,verdict;
    wire busy,done,trap,commit;
    wire [2:0] stage;
    wire [3:0] entity;
    wire [15:0] feature;
    wire [1:0] phase;
    mesh_soc #(.OPT(OPT)) soc(clk,rstpipe[1],1'b1,control[4:1],selected,verdict,trap,
        cycles,busy,done,stage,entity,commit,feature,phase);
    assign status={trap,verdict,cycles,selected};
    assign trace={busy,done,stage,entity,commit,feature,cycles};
endmodule
