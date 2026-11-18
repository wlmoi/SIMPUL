"""USB V4L2 or recorded video to aggregate traffic metrics and optional preview."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import time

from traffic import CLASSES, Traffic


def calibration(config, cv2, np):
    if config is None:
        return None
    points = np.asarray(config["image_points"], dtype=np.float32)
    ground = np.asarray(config["road_points_m"], dtype=np.float32)
    if points.shape != (4, 2) or ground.shape != (4, 2) or not (
        np.isfinite(points).all() and np.isfinite(ground).all()
        and ((points >= 0) & (points <= 1)).all()
        and cv2.isContourConvex(points) and cv2.isContourConvex(ground)
    ):
        raise ValueError("Provide four convex, ordered image and road calibration points")
    matrix = cv2.getPerspectiveTransform(points, ground)
    if abs(np.linalg.det(matrix)) < 1e-9:
        raise ValueError("Road calibration is singular")
    for key in ("segment_m", "lanes", "slow_kmh", "dense_per_km_lane", "slow_fraction", "hold_seconds"):
        if not np.isfinite(config[key]) or config[key] <= 0:
            raise ValueError(f"{key} must be finite and positive")
    if config["slow_fraction"] > 1 or int(config["lanes"]) != config["lanes"]:
        raise ValueError("slow_fraction must be ≤1 and lanes must be integral")
    return {**config, "homography": matrix.tolist()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="/dev/v4l/by-id/... or path to a video file")
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--model", default="yolo11n.pt", type=Path)
    parser.add_argument("--imgsz", type=int, default=416)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--web-preview", type=int, metavar="PORT")
    parser.add_argument("--max-frames", type=int, default=0)
    args = parser.parse_args()
    if not args.model.is_file():
        parser.error("Provide a local official YOLO11n .pt checkpoint or exported .onnx model")
    if args.imgsz < 32 or args.imgsz % 32 or args.max_frames < 0:
        parser.error("imgsz must be a positive multiple of 32 and max-frames cannot be negative")
    import cv2
    import numpy as np
    from ultralytics import YOLO

    config = json.loads(args.config.read_text(encoding="utf-8"))
    metrics = Traffic(config["roi"], config["line"], calibration(config.get("calibration"), cv2, np))
    model = YOLO(str(args.model), task="detect")
    labels = {i: label for i, label in model.names.items() if label in CLASSES}
    if set(labels.values()) != set(CLASSES):
        raise ValueError("YOLO11 model must expose car and motorcycle classes")
    live = args.source.startswith("/dev/")
    capture = cv2.VideoCapture(args.source, cv2.CAP_V4L2 if live else cv2.CAP_ANY)
    web = None
    try:
        if not capture.isOpened():
            raise RuntimeError(f"Cannot open {args.source}")
        if live:
            capture.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))
            capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        fps = capture.get(cv2.CAP_PROP_FPS)
        if not live and not 0 < fps < 1000:
            raise RuntimeError("Video file requires valid frame-rate metadata")
        if args.web_preview:
            from preview import Preview
            web = Preview(args.web_preview)
        start = time.monotonic()
        frame_index, last_report = 0, -1
        while not args.max_frames or frame_index < args.max_frames:
            ok, frame = capture.read()
            if not ok:
                if live or not frame_index:
                    raise RuntimeError(f"Frame acquisition stopped at frame {frame_index}")
                break
            stamp = time.monotonic() - start if live else frame_index / fps
            h, w = frame.shape[:2]
            result = model.track(frame, persist=True, classes=list(labels), tracker="bytetrack.yaml",
                                 imgsz=args.imgsz, conf=0.25, device=args.device, verbose=False,
                                 rect=False)[0]
            boxes = result.boxes
            detections = []
            if boxes is not None and len(boxes):
                ids = boxes.id.int().cpu().tolist() if boxes.id is not None else [None]*len(boxes)
                for ident, cls, (x1, _, x2, y2) in zip(ids, boxes.cls.int().cpu().tolist(), boxes.xyxy.cpu().tolist()):
                    detections.append((ident, labels[cls], ((x1+x2)/(2*w), y2/h)))
            stats = metrics.step(stamp, detections)
            frame_index += 1
            report = {
                "source": "kria_v4l2" if live else "recorded_video",
                "utc": datetime.now(timezone.utc).isoformat(),
                "frame": frame_index, "source_seconds": round(stamp, 3), "resolution": [w, h],
                "processed_fps": round(frame_index/max(time.monotonic()-start, 0.001), 2),
                **stats,
            }
            if stamp - last_report >= 1:
                print(json.dumps(report), flush=True)
                last_report = stamp
            if args.preview or web:
                draw = result.plot(labels=False)
                pixel = lambda p: (round(p[0]*w), round(p[1]*h))
                cv2.polylines(draw, [np.array([pixel(p) for p in metrics.roi], np.int32)], True, (0, 255, 255), 2)
                cv2.line(draw, *(pixel(p) for p in metrics.line), (255, 255, 0), 2)
                status = stats["visible"]
                caption = f'Mobil {status["car"]} | Motor {status["motorcycle"]} | {stats["congestion"]}'
                cv2.rectangle(draw, (0, 0), (w, 34), (0, 0, 0), -1)
                cv2.putText(draw, caption, (8, 23), cv2.FONT_HERSHEY_SIMPLEX, .55, (255, 255, 255), 1, cv2.LINE_AA)
                if web:
                    encoded, jpeg = cv2.imencode(".jpg", draw, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    if encoded:
                        web.push(jpeg.tobytes(), report)
                if args.preview:
                    cv2.imshow("SIMPUL - YOLO11 Traffic", draw)
                    if cv2.waitKey(1) & 255 in (ord("q"), 27):
                        break
        if stamp != last_report:
            print(json.dumps(report), flush=True)
    finally:
        capture.release()
        if web:
            web.close()
        if args.preview:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    raise SystemExit(main())
