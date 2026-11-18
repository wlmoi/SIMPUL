module engine #(parameter OPT=1)(
    input clk, resetn, start, advance,
    input [3:0] read_index, output [7:0] read_data,
    output reg busy, done, output reg [31:0] cycles,
    output [2:0] stage, output [3:0] entity, output commit,
    output signed [15:0] feature_data, output [1:0] phase_debug
);
    localparam LAST=5647;
    reg [12:0] pc;
    reg [1:0] phase;
    reg [27:0] ins;
    (* rom_style="block" *) reg [27:0] schedule [0:LAST];
    (* ram_style="block" *) reg signed [15:0] features [0:1023];
    reg [7:0] outputs [0:15];
    initial $readmemh("schedule.mem",schedule);
    initial $readmemh("features.mem",features);
    wire [2:0] op=ins[27:25];
    wire [9:0] address=ins[9:0];
    wire signed [7:0] weight=ins[17:10];
    reg signed [15:0] operand;
    (* use_dsp="yes" *) reg signed [31:0] acc;
    function signed [7:0] quant;
        input signed [31:0] sum;
        input relu;
        reg signed [31:0] q;
        begin
            q=(sum+32'sd16) >>> 5;
            if (q>127) quant=127;
            else if (relu && q<0) quant=0;
            else if (q < -128) quant=-128;
            else quant=q[7:0];
        end
    endfunction
    wire signed [7:0] rounded=quant(acc,op==1);
    assign feature_data=op==3 ? acc[15:0] : {{8{rounded[7]}},rounded};
    assign stage=ins[24:22];
    assign entity=ins[21:18];
    assign phase_debug=phase;
    assign read_data=outputs[read_index];
    wire step=resetn && busy && advance;
    assign commit=step && phase==2 && op!=0;

    always @(posedge clk) begin
        if (step && phase==0 || !OPT) ins<=schedule[pc];
        if (step && phase==1 && op==0 || !OPT) operand<=features[address];
        if (commit) features[address]<=feature_data;
        if (commit && stage==5) outputs[address[3:0]]<=rounded;
    end
    always @(posedge clk) begin
        if (!resetn) begin
            busy<=0; done<=0; pc<=0; cycles<=0; phase<=0; acc<=0;
        end else if (!busy && start) begin
            busy<=1; done<=0; pc<=0; cycles<=0; phase<=0; acc<=0;
        end else if (busy) begin
            cycles<=cycles+1;
            if (advance) begin
                if (phase==2) begin
                    if (op==0) acc<=acc+operand*weight;
                    else acc<=0;
                    if (pc==LAST) begin busy<=0; done<=1; end
                    else pc<=pc+1;
                    phase<=0;
                end else phase<=phase+1;
            end
        end
    end
endmodule
