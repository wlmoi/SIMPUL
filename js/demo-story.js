/** Presentation-only story. No observations, measurements or decisions are saved. */
export const DEMO_SECONDS=8;
export const DEMO_INPUTS=Object.freeze({volume:2100,pickupShare:18,seed:11});
export const DEMO_STAGES=Object.freeze([
 {id:'demand',scenario:'A0',warmup:35,target:[-60,3,12],dist:140,label:['Kebutuhan jemput','Pickup demand'],title:['Semua ingin bertemu di dekat pintu MRT.','Everyone wants to meet near the MRT entrance.'],text:['Dalam contoh ini, kendaraan melintas berbagi tepi jalan dengan kendaraan penjemput. Kebutuhan bertemu dekat stasiun dapat memusatkan aktivitas pada ruang yang terbatas.','In this example, through traffic shares the curb with pickup vehicles. Meeting near the station can concentrate demand in limited space.'],focus:['Perhatikan pintu stasiun dan ruang tepi jalan.','Look at the station entrance and curb space.'],question:['Di mana penumpang dan kendaraan bertemu?','Where do passengers and vehicles meet?']},
 {id:'stopping',scenario:'A0',warmup:100,target:[-80,2,12],dist:105,label:['Berhenti di lajur','Stopping in a lane'],title:['Ruang bergerak dipakai untuk menunggu.','Road space becomes waiting space.'],text:['Model A0 mengizinkan aktivitas jemput di lajur kiri. Kendaraan yang menunggu dapat mengurangi ruang kendaraan melintas. Ini mekanisme dalam model, bukan bukti pelanggaran.','The A0 model allows pickup activity in the left lane. Waiting vehicles can reduce space for passing traffic. This is a model mechanism, not evidence of an offence.'],focus:['Kendaraan berwarna jingga sedang berhenti dalam model.','Orange vehicles are stopped in the model.'],question:['Berapa lama kendaraan berhenti dan di zona mana?','How long do vehicles stop, and in which zone?']},
 {id:'queue',scenario:'A0',warmup:160,target:[-110,3,9],dist:150,label:['Potensi hambatan','Potential obstruction'],title:['Kendaraan berikutnya harus memperlambat atau berpindah lajur.','Following vehicles slow down or change lanes.'],text:['Sorotan menunjukkan kendaraan melambat di belakang titik berhenti. Antrean juga dipengaruhi volume, penyempitan dan geometri; hubungan sebab-akibat di Fatmawati harus diuji di lapangan.','The highlight shows vehicles slowing behind a stopping point. Demand, narrowing and geometry also affect queues; causation at Fatmawati needs field validation.'],focus:['Merah: kendaraan model yang bergerak lambat.','Red: slow-moving vehicles in the model.'],question:['Ukur volume, panjang antrean dan akses pejalan pada interval yang sama.','Measure volume, queue length and pedestrian access in matched intervals.']},
 {id:'pickup',scenario:'A1',warmup:160,target:[0,3,22],dist:150,label:['Uji area jemput','Test pickup space'],title:['A1: arahkan aktivitas jemput ke ruang khusus.','A1: move pickup activity into dedicated space.'],text:['Model memindahkan sebagian aktivitas ke area jemput. Ruang ini merupakan alternatif skematis, bukan fasilitas yang sudah dikonfirmasi tersedia. Permintaan dan seed tetap sama.','The model moves pickup activity into a dedicated area. This is a schematic alternative, not a confirmed available facility. Demand and seed remain the same.'],focus:['Biru: lokasi alternatif jemput pada model A1.','Blue: the alternative pickup location in A1.'],question:['Apakah ruang, kapasitas dan jalur pejalan aman serta diizinkan?','Is the space available, permitted and safe for pedestrians?']},
 {id:'duration',scenario:'A2',warmup:160,target:[20,3,12],dist:155,label:['Uji lokasi & durasi','Test location & duration'],title:['A2: uji lokasi dan waktu berhenti yang lebih singkat.','A2: test stopping locations and shorter dwell times.'],text:['A2 mengubah aturan lokasi dan durasi di dalam model. Kepatuhan tidak diasumsikan sempurna. Ini alternatif penelitian yang memerlukan tinjauan manusia, bukan penetapan aturan otomatis.','A2 changes model stopping locations and dwell times. Compliance is not assumed perfect. This research alternative needs human review, not automatic rule enforcement.'],focus:['Lihat perubahan pola berhenti pada skenario A2.','Inspect the stopping pattern in A2.'],question:['Bagaimana kepatuhan, kenyamanan penumpang dan aksesibilitas diukur?','How will compliance, passenger comfort and accessibility be measured?']},
 {id:'review',scenario:'A2',warmup:160,target:[0,10,4],dist:195,label:['Bandingkan & evaluasi','Compare & review'],title:['Bandingkan model. Putuskan setelah ada bukti.','Compare the model. Decide after collecting evidence.'],text:['Tabel memakai permintaan, seed dan periode model yang sama: pemanasan 90 detik lalu pengukuran 300 detik. Nilainya bukan hasil lapangan atau rekomendasi penataan yang tervalidasi.','The table uses matched demand, seed and model periods: 90 seconds of warm-up, then 300 seconds of sampling. Values are not field findings or validated recommendations.'],focus:['Alur lengkap: observasi → interpretasi → simulasi → evaluasi manusia.','Full workflow: observe → interpret → simulate → human evaluation.'],question:['Kumpulkan observasi manual dan kalibrasi sebelum merekomendasikan intervensi.','Collect manual observations and calibrate before recommending an intervention.']}
].map(stage=>Object.freeze(stage)));

export function initialDemo(){return {index:0,elapsed:0,playing:false,started:false,complete:false};}
export function selectDemo(state,index){
 if(!Number.isInteger(index)||index<0||index>=DEMO_STAGES.length)return state;
 return {...state,index,elapsed:0,playing:false,started:true,complete:false};
}
export function playDemo(state){
 const base=state.complete?initialDemo():state;
 return {...base,started:true,playing:!base.playing};
}
export function advanceDemo(state,seconds){
 if(!state.playing||!Number.isFinite(seconds)||seconds<=0)return state;
 let index=state.index,elapsed=state.elapsed+seconds;
 while(elapsed>=DEMO_SECONDS){
  elapsed-=DEMO_SECONDS;
  if(index===DEMO_STAGES.length-1)return {...state,index,elapsed:DEMO_SECONDS,playing:false,complete:true};
  index++;
 }
 return {...state,index,elapsed};
}
