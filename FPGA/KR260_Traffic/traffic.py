"""Track occupancy, finite-line crossings and calibrated congestion."""
from collections import Counter, deque
from dataclasses import dataclass, field
from math import hypot, isfinite

CLASSES = ("car", "motorcycle")


def cross(a, b, p):
    return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])


def inside(point, polygon):
    x, y = point
    result = False
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        if abs(cross(a, b, point)) < 1e-9 and (
            min(a[0], b[0]) <= x <= max(a[0], b[0])
            and min(a[1], b[1]) <= y <= max(a[1], b[1])
        ):
            return True
        if (a[1] > y) != (b[1] > y):
            if x < a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]):
                result = not result
    return result


@dataclass
class Track:
    seen: float
    votes: Counter = field(default_factory=Counter)
    side: int = 0
    point: tuple | None = None
    counted: bool = False
    samples: deque = field(default_factory=deque)

    @property
    def label(self):
        return self.votes.most_common(1)[0][0]


class Traffic:
    def __init__(self, roi, line, calibration=None):
        self.roi = [tuple(p) for p in roi]
        self.line = [tuple(p) for p in line]
        if len(self.roi) < 3 or len(self.line) != 2 or self.line[0] == self.line[1]:
            raise ValueError("ROI and line coordinates are invalid")
        if any(len(p) != 2 or not all(0 <= x <= 1 for x in p) for p in self.roi + self.line):
            raise ValueError("ROI and line coordinates must be normalized x/y pairs")
        if not all(inside(p, self.roi) for p in self.line):
            raise ValueError("Counting line must lie within the road ROI")
        self.calibration = calibration
        self.tracks = {}
        self.totals = {"a_to_b": Counter(), "b_to_a": Counter()}
        self.slow_since = None
        self.now = None

    def step(self, now, detections):
        """detections contain normalized bottom-center points and ByteTrack IDs."""
        if not isfinite(now) or (self.now is not None and now <= self.now):
            raise ValueError("Frame timestamps must increase")
        if self.now is not None and now - self.now > 2:
            self.slow_since = None
        self.now = now
        self.tracks = {key: value for key, value in self.tracks.items() if now - value.seen <= 2}
        visible = Counter()
        speed = []
        a, b = self.line
        for ident, label, point in detections:
            if label not in CLASSES or not inside(point, self.roi):
                continue
            if ident is None:
                visible[label] += 1
                continue
            track = self.tracks.setdefault(ident, Track(now))
            track.seen = now
            track.votes[label] += 1
            visible[track.label] += 1
            distance = cross(a, b, point) / hypot(b[0] - a[0], b[1] - a[1])
            if abs(distance) > 0.012:
                side = 1 if distance > 0 else -1
                if track.side and side != track.side and not track.counted:
                    # The vehicle path must intersect the segment, not its extension.
                    if cross(track.point, point, a) * cross(track.point, point, b) <= 0:
                        direction = "a_to_b" if side > 0 else "b_to_a"
                        self.totals[direction][track.label] += 1
                        track.counted = True
                track.side, track.point = side, point
            if self.calibration:
                h = self.calibration["homography"]
                x, y = point
                w = h[2][0] * x + h[2][1] * y + h[2][2]
                if abs(w) < 1e-9:
                    continue
                xy = tuple((row[0] * x + row[1] * y + row[2]) / w for row in h[:2])
                track.samples.append((now, xy))
                while now - track.samples[0][0] > 2:
                    track.samples.popleft()
                first, origin = track.samples[0]
                if now - first >= 0.75:
                    speed.append(3.6 * hypot(xy[0] - origin[0], xy[1] - origin[1]) / (now - first))
        density, congestion, slow_fraction = None, "uncalibrated", None
        if self.calibration:
            c = self.calibration
            count = sum(visible.values())
            density = round(1000 * count / (c["segment_m"] * c["lanes"]), 1)
            congestion = "insufficient_speed_samples"
            # Require speed estimates for at least half of visible vehicles.
            if count == 0 or (speed and len(speed) * 2 >= count):
                slow_fraction = sum(v <= c["slow_kmh"] for v in speed) / len(speed) if speed else 0
                condition = density >= c["dense_per_km_lane"] and slow_fraction >= c["slow_fraction"]
                if condition and self.slow_since is None:
                    self.slow_since = now
                if not condition:
                    self.slow_since = None
                congestion = "below_threshold"
                if condition:
                    congestion = "congested" if now - self.slow_since >= c["hold_seconds"] else "pending"
            else:
                self.slow_since = None
        return {
            "visible": {k: visible[k] for k in CLASSES},
            "crossings": {direction: {k: counts[k] for k in CLASSES}
                          for direction, counts in self.totals.items()},
            "density_vehicles_per_km_lane": density,
            "congestion": congestion,
            "slow_fraction": slow_fraction,
            "speed_samples": len(speed),
        }
