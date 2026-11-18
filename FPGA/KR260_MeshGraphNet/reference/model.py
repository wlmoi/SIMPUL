"""Generate the fixed graph, independent integer oracle and scalar MAC schedule."""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEM = ROOT / "mem"
MEM.mkdir(exist_ok=True)
rng = random.Random(260)
nodes = [[rng.randint(-55, 55) for _ in range(4)] for _ in range(8)]
edges = [[rng.randint(-50, 50) for _ in range(3)] for _ in range(16)]
src = [e % 8 for e in range(16)]
dst = [(s + (3 if e < 8 else 1)) % 8 for e, s in enumerate(src)]
dims = [(4, 8), (3, 8), (24, 8), (16, 8), (8, 2)]
weights = [[[rng.randint(-14, 14) for _ in range(i)] for _ in range(o)] for i, o in dims]


def evaluate(bits):
    # All candidates retain the same real range [-4,4).
    scale = 1 << (bits - 3)
    def clip(x):
        return max(-(1 << (bits-1)), min((1 << (bits-1))-1, x))
    def convert(x):
        return clip((x * scale + 16) // 32)
    def dense(stage, rows, residual=None):
        result = []
        for n, row in enumerate(rows):
            ys = []
            for j, w in enumerate(weights[stage]):
                a = sum(x * convert(y) for x, y in zip(row, w))
                if residual is not None:
                    a += residual[n][j] * scale
                q = clip((a + scale//2) // scale)
                ys.append(max(0, q) if stage != 4 else q)
            result.append(ys)
        return result
    h = dense(0, [[convert(x) for x in row] for row in nodes])
    z = dense(1, [[convert(x) for x in row] for row in edges])
    msg = dense(2, [z[e]+h[src[e]]+h[dst[e]] for e in range(16)], z)
    agg = [[0]*8 for _ in h]
    for e, row in enumerate(msg):
        for j, x in enumerate(row):
            agg[dst[e]][j] += x
    u = dense(3, [x+y for x,y in zip(h,agg)], h)
    return [v for row in dense(4,u) for v in row]


def hexfile(name, values, width):
    (MEM / name).write_text("".join(f"{x & ((1 << width)-1):0{(width+3)//4}x}\n" for x in values))


# One BRAM address space. Graph inputs persist across inferences.
def row(base, n, width=8):
    return list(range(base+n*width, base+(n+1)*width))
program = []
stage_ends = []
def layer(stage, matrix, inputs, out, residual=None):
    for n, addresses in enumerate(inputs):
        for j, wrow in enumerate(weights[matrix]):
            for address,w in zip(addresses,wrow):
                emit(0,address,w,stage,n)
            if residual is not None:
                emit(0,residual[n][j],32,stage,n)
            emit(2 if stage==5 else 1,out[n][j],0,stage,n)
    stage_ends.append(len(program))

N=[row(0,n,4) for n in range(8)]
E=[row(32,e,3) for e in range(16)]
H=[row(80,n) for n in range(8)]
Z=[row(144,e) for e in range(16)]
M=[row(272,e) for e in range(16)]
A=[row(400,n) for n in range(8)]
U=[row(464,n) for n in range(8)]
O=[row(528,n,2) for n in range(8)]
# Instruction fields carry the opcode, stage, entity, signed coefficient and RAM address.
def emit(op, address, coefficient, stage, entity):
    program.append((op<<25)|(stage<<22)|(entity<<18)|((coefficient&255)<<10)|address)
layer(0,0,N,H)
layer(1,1,E,Z)
layer(2,2,[Z[e]+H[src[e]]+H[dst[e]] for e in range(16)],M,Z)
for n in range(8):
    incoming=[e for e in range(16) if dst[e]==n]
    for j in range(8):
        for e in incoming:
            emit(0,M[e][j],1,3,e)
        emit(3,A[n][j],0,3,n)
stage_ends.append(len(program))
layer(4,3,[H[n]+A[n] for n in range(8)],U,H)
layer(5,4,U,O)
hexfile("schedule.mem",program,28)
hexfile("features.mem",sum(nodes+edges,[])+[0]*(1024-80),16)
gold=evaluate(8)
hexfile("expected.mem",gold,8)
(ROOT/"firmware"/"expected.h").write_text("static const signed char expected[16] = {"+",".join(map(str,gold))+"};\n")
report = {"signed_bits":8,"fraction_bits":5,"golden":gold,"instruction_count":len(program),
          "stage_cycles":[3*(b-a) for a,b in zip([0]+stage_ends,stage_ends)],
          "lower_precision_max_error_in_int8_lsb":{
              b:max(abs(x*(1<<(8-b))-y) for x,y in zip(evaluate(b),gold)) for b in range(4,8)}}
(ROOT/"reports"/"reference.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps(report))
