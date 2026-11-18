"""Build, simulate or run the demo using local AMD tools."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("action", choices=["firmware", "sim", "build", "run"])
parser.add_argument("--candidate", choices=["optimized", "baseline"], default="optimized")
args = parser.parse_args()
candidate = args.candidate
amd = Path(os.environ.get("AMD_ROOT", "D:/AMD/2026.1"))
def run(command, cwd=root):
    subprocess.run([(x.as_posix() if isinstance(x, Path) else str(x)) for x in command], cwd=cwd, check=True)
def tool(name):
    return shutil.which(name) or str(amd/"Vivado/bin"/(name+".bat"))
def vivado(script):
    run([tool("vivado"), "-mode", "batch", "-nojournal", "-source", root/script, "-tclargs", candidate])
if args.action=="firmware":
    gcc=amd/"gnu/riscv/nt/bin/riscv64-unknown-elf-gcc.exe"
    run([sys.executable,"reference/model.py"])
    run([gcc,"-march=rv32i","-mabi=ilp32","-Os","-nostdlib","-ffreestanding","-msmall-data-limit=0",
         "-Wl,--build-id=none","-T","firmware/link.ld","firmware/start.S","firmware/main.c","-o","firmware/demo.elf"])
    run([gcc.with_name("riscv64-unknown-elf-objcopy.exe"),"-O","binary","firmware/demo.elf","firmware/demo.bin"])
    run([sys.executable,"firmware/pack.py"])
if args.action=="sim":
    folder=root/"build"/("sim_"+candidate)
    folder.mkdir(parents=True, exist_ok=True)
    for f in (root/"mem").glob("*.mem"):
        shutil.copy2(f,folder/f.name)
    run([tool("xvlog"),"--sv",root/"rtl/riscv/picorv32.v",root/"rtl/accelerator/engine.v",
         root/"rtl/interfaces/mesh_soc.v",root/"tb/tb.sv"],folder)
    run([tool("xelab"),("tb" if candidate=="optimized" else "tb_baseline"),"--mt","2","--cc_type","sbt","-debug","typical","-s","mesh_test"],folder)
    run([tool("xsim"),"mesh_test","-tclbatch",root/"demo/sim.tcl"],folder)
    log=(folder/"xsim.log").read_text(errors="replace")
    if "PASS PicoRV32" not in log or "Fatal:" in log:
        sys.exit("XSim failed; inspect "+str(folder))
    reports=root/"reports"/candidate
    reports.mkdir(parents=True,exist_ok=True)
    (reports/"verification.txt").write_text("\n".join(x for x in log.splitlines() if x.startswith(("PASS","inference ")))+"\n")
if args.action=="build" or (args.action=="run" and not (root/"image"/candidate/"mesh.bit").exists()):
    vivado("vivado/build.tcl")
if args.action=="run":
    vivado("demo/program.tcl")
