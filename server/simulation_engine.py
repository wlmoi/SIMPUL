"""Synthetic SUMO simulation engine (NOT a calibrated Fatmawati twin).

Core simulation methods are independent of FastAPI, authentication, and the web UI.
They can be exercised in separate tests if `sumo` and `netconvert` are installed.
"""
from __future__ import annotations
import math
import os
import random
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
import xml.etree.ElementTree as ET
from pydantic import BaseModel, Field

SUMO=shutil.which('sumo') or (str(Path(os.environ.get('SUMO_HOME',''))/'bin'/'sumo') if os.environ.get('SUMO_HOME') else None)
NETCONVERT=shutil.which('netconvert') or (str(Path(os.environ.get('SUMO_HOME',''))/'bin'/'netconvert') if os.environ.get('SUMO_HOME') else None)
if SUMO and not Path(SUMO).exists():SUMO=None
if NETCONVERT and not Path(NETCONVERT).exists():NETCONVERT=None

class ScenarioParams(BaseModel):
    traffic:int=Field(850,ge=200,le=1500)
    pickupShare:float=Field(18,ge=0,le=45)
    dwell:float=Field(55,ge=5,le=180)
    diversion:float=Field(75,ge=0,le=100)
    ruleDwell:float=Field(20,ge=5,le=120)
    pedestrianDetour:float=Field(100,ge=0,le=500)
    seeds:int=Field(2,ge=1,le=3)

def write_xml(path,root): ET.ElementTree(root).write(path,encoding='utf-8',xml_declaration=True)

def _run_cmd(args,cwd,timeout=55):
    try:
        res=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout,check=False)
    except subprocess.TimeoutExpired as exc: raise RuntimeError(f'Proses SUMO melewati batas {timeout}s') from exc
    if res.returncode!=0: raise RuntimeError(f'Executable {args[0]} gagal: {res.stderr[-1100:]}')

def make_network(workdir):
    nodes=ET.Element('nodes')
    for n,x,y in [('W',0,0),('M',120,0),('P',210,-65),('E',320,0)]:ET.SubElement(nodes,'node',id=n,x=str(x),y=str(y),type='priority')
    edges=ET.Element('edges')
    for eid,a,b in [('W_M','W','M'),('M_E','M','E'),('M_P','M','P'),('P_E','P','E')]:ET.SubElement(edges,'edge',id=eid,**{'from':a,'to':b},numLanes='1',speed='13.89',priority='1')
    write_xml(workdir/'nodes.nod.xml',nodes);write_xml(workdir/'edges.edg.xml',edges)
    _run_cmd([NETCONVERT,'--node-files','nodes.nod.xml','--edge-files','edges.edg.xml','--output-file','demo.net.xml','--no-turnarounds','true'],workdir)

def create_routes(workdir,p:ScenarioParams,code:str,seed:int):
    routes=ET.Element('routes')
    ET.SubElement(routes,'vType',id='car',accel='2.6',decel='4.5',sigma='0.25',length='5',minGap='2.5',maxSpeed='13.89')
    ET.SubElement(routes,'route',id='main',edges='W_M M_E')
    ET.SubElement(routes,'route',id='pickup',edges='W_M M_P P_E')
    rng=random.Random(seed)
    n=min(360,round(p.traffic*600/3600))
    for i in range(n):
        depart=round((i+0.2)*600/max(n,1),2)
        pickup=rng.random()<p.pickupShare/100
        redirected=pickup and code=='A1' and rng.random()<p.diversion/100
        route='pickup' if redirected else 'main'
        v=ET.SubElement(routes,'vehicle',id=f'veh{i}',type='car',route=route,depart=str(depart),departSpeed='max')
        if pickup:
            lane='P_E_0' if redirected else 'M_E_0'
            dwell=int(min(p.dwell,p.ruleDwell)) if code=='A2' else int(p.dwell)
            ET.SubElement(v,'stop',lane=lane,endPos='42',duration=str(dwell))
    write_xml(workdir/'routes.rou.xml',routes)
    additionals=ET.Element('additional')
    ET.SubElement(additionals,'laneAreaDetector',id='queue-main',lane='M_E_0',pos='8',length='125',freq='30',file='queue.xml')
    write_xml(workdir/'additional.add.xml',additionals)
    config=ET.Element('configuration')
    inp=ET.SubElement(config,'input')
    for key,value in [('net-file','demo.net.xml'),('route-files','routes.rou.xml'),('additional-files','additional.add.xml')]:ET.SubElement(inp,key,value=value)
    timeel=ET.SubElement(config,'time');ET.SubElement(timeel,'begin',value='0');ET.SubElement(timeel,'end',value='1600')
    output=ET.SubElement(config,'output');ET.SubElement(output,'tripinfo-output',value='tripinfo.xml')
    write_xml(workdir/'demo.sumocfg',config)

def parse_results(workdir):
    trips=ET.parse(workdir/'tripinfo.xml').getroot()
    delays=[];waits=[]
    for elem in trips.findall('tripinfo'):
        delays.append(float(elem.get('timeLoss',0)))
        waits.append(float(elem.get('waitingTime',0)))
    if not delays: raise RuntimeError('SUMO tidak menghasilkan tripinfo; periksa skenario dan file rute.')
    jams=[]
    if (workdir/'queue.xml').exists():
        for e in ET.parse(workdir/'queue.xml').getroot().findall('interval'):
            for attribute in ['maxJamLengthInVehicles','meanMaxJamLengthInVehicles','meanHaltingNumber']:
                if e.get(attribute) is not None:
                    jams.append(float(e.get(attribute)))
                    break
    return {'delay':sum(delays)/len(delays),'queue':sum(jams)/len(jams) if jams else 0,'completed':len(delays),'meanWait':sum(waits)/len(waits)}

def compute(p:ScenarioParams):
    start=time.monotonic();all_results={code:[] for code in ('A0','A1','A2')}
    with tempfile.TemporaryDirectory(prefix='simpul-sumo-') as td:
        root=Path(td);make_network(root)
        for code in all_results:
            for k in range(p.seeds):
                sub=root/f'{code}_{k}';sub.mkdir()
                shutil.copyfile(root/'demo.net.xml',sub/'demo.net.xml')
                create_routes(sub,p,code,seed=100+k)
                _run_cmd([SUMO,'-c','demo.sumocfg','--seed',str(100+k),'--no-step-log','true','--no-warnings','true'],sub,timeout=55)
                all_results[code].append(parse_results(sub))
    results=[]
    for code,runs in all_results.items():
        d=sum(x['delay'] for x in runs)/len(runs)
        q=sum(x['queue'] for x in runs)/len(runs)
        access=p.pedestrianDetour+(p.diversion/100*65 if code=='A1' else 0)
        results.append({'id':code,'delay':round(d,1),'queue':round(q,1),'access':round(access),
        'events':round(p.traffic*(p.pickupShare/100)),'completed':sum(x['completed'] for x in runs),
        'timeLossStd':round(math.sqrt(sum((x['delay']-d)**2 for x in runs)/len(runs)),2),
        'estimated':False,'model':'SUMO pada jaringan sintetis, tidak dikalibrasi terhadap Fatmawati'})
    return {'engine':'sumo','valid':False,'evidence':'synthetic','createdAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),
    'scenarios':results,'assumptions':p.model_dump(),'runtimeSeconds':round(time.monotonic()-start,1),
    'message':'Jaringan uji sintetis, bukan digital twin Fatmawati. Hasil SUMO ini belum divalidasi terhadap observasi lapangan. Jarak pedestrian adalah input asumsi.'}



def engine_status() -> dict:
    """Describe binary readiness separately from model calibration status."""
    return {
        'engineAvailable': bool(SUMO and NETCONVERT),
        'engine': 'SUMO' if SUMO and NETCONVERT else None,
        'dataset': 'synthetic demonstration only',
        'calibrated': False,
    }
