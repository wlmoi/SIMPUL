from pathlib import Path
p = Path(__file__).resolve().parents[1]
image = (p/"firmware/demo.bin").read_bytes()
if len(image)>4096:
    raise ValueError("firmware exceeds BRAM")
image = image.ljust(4096,b"\0")
(p/"mem/firmware.mem").write_text("".join(f"{int.from_bytes(image[i:i+4],'little'):08x}\n" for i in range(0,4096,4)))
