module mesh_soc #(parameter OPT=1)(
    input clk, resetn, advance, input [3:0] select_output,
    output [7:0] selected_data, output reg [7:0] verdict, output trap,
    output [31:0] cycles, output busy, done,
    output [2:0] stage, output [3:0] entity, output commit,
    output signed [15:0] feature_data, output [1:0] phase_debug
);
    wire valid;
    wire [31:0] addr,wdata;
    wire [3:0] strb;
    reg ready;
    reg [31:0] rdata;
    wire request=valid && !ready && resetn;
    wire io=addr[31:8]==24'h100000;
    wire start=request && io && addr[7:0]==0 && strb==15 && wdata[0];
    picorv32 #(.ENABLE_COUNTERS(0), .ENABLE_COUNTERS64(0),
               .ENABLE_IRQ(0), .ENABLE_MUL(0), .ENABLE_DIV(0)) cpu (
        .clk(clk),.resetn(resetn),.trap(trap),.mem_valid(valid),
        .mem_ready(ready),.mem_addr(addr),.mem_wdata(wdata),.mem_wstrb(strb),
        .mem_rdata(rdata),.irq(32'b0),.pcpi_wr(1'b0),.pcpi_rd(32'b0),
        .pcpi_wait(1'b0),.pcpi_ready(1'b0));
    wire [7:0] result_byte;
    wire cpu_output=request && io && addr[7:6]==1;
    assign selected_data=result_byte;
    engine #(.OPT(OPT)) accelerator(.clk(clk),.resetn(resetn),.start(start),.advance(advance),
        .read_index(cpu_output ? addr[5:2] : select_output),.read_data(result_byte),
        .busy(busy),.done(done),.cycles(cycles),.stage(stage),.entity(entity),
        .commit(commit),.feature_data(feature_data),.phase_debug(phase_debug));
    (* ram_style="block" *) reg [31:0] ram [0:1023];
    initial $readmemh("firmware.mem",ram);
    reg [31:0] ram_data,io_data;
    reg was_io;
    always @* rdata=was_io ? io_data : ram_data;
    integer b;
    always @(posedge clk) begin
        if (request && addr[31:12]==0) begin
            ram_data<=ram[addr[11:2]];
            for (b=0;b<4;b=b+1)
                if (strb[b]) ram[addr[11:2]][b*8+:8]<=wdata[b*8+:8];
        end
        if (!resetn) begin ready<=0; verdict<=0; was_io<=0; end
        else begin
            ready<=request;
            if (request) begin
                was_io<=io;
                if (io) case (addr[7:0])
                    0: io_data<={30'b0,done,busy};
                    4: io_data<=cycles;
                    8: begin io_data<={24'b0,verdict}; if (strb==15) verdict<=wdata[7:0]; end
                    default: io_data<={24'b0,result_byte};
                endcase
            end
        end
    end
endmodule
