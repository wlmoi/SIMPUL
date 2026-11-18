"""Produce RTL SAIF for the actual firmware workload, then annotate the routed netlist."""
import os
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
candidate = sys.argv[1]
if candidate not in {"baseline","optimized"}:
    raise ValueError(candidate)
folder = root/"build"/("activity_"+candidate)
folder.mkdir(exist_ok=True,parents=True)
for f in (root/"mem").glob("*.mem"):
    shutil.copy2(f,folder/f.name)
tools = Path(os.environ.get("AMD_ROOT","D:/AMD/2026.1"))/"Vivado/bin"
def run(name,*args):
    subprocess.run([str(tools/(name+".bat")),*(str(x).replace("\\","/") for x in args)],cwd=folder,check=True)
flags = ["-d","BASELINE"] if candidate=="baseline" else []
run("xvlog","--sv",*flags,root/"rtl/riscv/picorv32.v",root/"rtl/accelerator/engine.v",
    root/"rtl/interfaces/mesh_soc.v",root/"tb/power_tb.sv")
run("xelab","power_tb","--mt","2","-debug","all","-s","activity")
run("xsim","activity","-tclbatch",root/"demo/activity.tcl")
if "SAIF_PASS" not in (folder/"xsim.log").read_text(errors="replace"):
    raise RuntimeError("SAIF capture failed")
if "--capture-only" not in sys.argv:
    run("vivado","-mode","batch","-nojournal","-source",root/"vivado/power.tcl","-tclargs",candidate)
