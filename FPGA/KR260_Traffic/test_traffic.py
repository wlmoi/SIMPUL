from unittest import TestCase, main
from traffic import Traffic

ROI = [(0,0),(1,0),(1,1),(0,1)]
LINE = [(0.25,0.5),(0.75,0.5)]
CAL = {"homography":[[100,0,0],[0,100,0],[0,0,1]],"segment_m":100,"lanes":1,
       "slow_kmh":5,"dense_per_km_lane":20,"slow_fraction":.5,"hold_seconds":2}


class TrafficTest(TestCase):
    def test_visible_direction_and_finite_crossing(self):
        t = Traffic(ROI, LINE)
        t.step(0, [(1,"car",(.4,.4)), (2,"motorcycle",(.6,.6)), (3,"car",(.9,.4))])
        out = t.step(1, [(1,"car",(.4,.6)), (2,"motorcycle",(.6,.4)), (3,"car",(.9,.6)),
                         (None,"motorcycle",(.1,.1)), (4,"bus",(.5,.5)), (5,"car",(-.1,.5))])
        self.assertEqual(out["visible"],{"car":2,"motorcycle":2})
        self.assertEqual(out["crossings"], {"a_to_b":{"car":1,"motorcycle":0},
                                            "b_to_a":{"car":0,"motorcycle":1}})
        out = t.step(2, [(1,"car",(.4,.4))])
        self.assertEqual(out["crossings"]["b_to_a"]["car"],0)
        self.assertEqual(out["congestion"],"uncalibrated")

    def test_dense_stationary_then_empty(self):
        t = Traffic(ROI, LINE, CAL)
        cars = [(1,"car",(.4,.4)),(2,"motorcycle",(.6,.6))]
        self.assertEqual(t.step(0,cars)["congestion"],"insufficient_speed_samples")
        self.assertEqual(t.step(1,cars)["congestion"],"pending")
        self.assertEqual(t.step(2,cars)["density_vehicles_per_km_lane"],20)
        self.assertEqual(t.step(3,cars)["congestion"],"congested")
        self.assertEqual(t.step(4,[])["congestion"],"below_threshold")

    def test_coverage_gap_cancels_pending(self):
        t = Traffic(ROI, LINE, CAL)
        cars = [(1,"car",(.4,.4)),(2,"motorcycle",(.6,.6))]
        t.step(0,cars)
        self.assertEqual(t.step(1,cars)["congestion"],"pending")
        self.assertEqual(t.step(5,cars)["congestion"],"insufficient_speed_samples")
        self.assertEqual(t.step(6,cars)["congestion"],"pending")


if __name__ == "__main__":
    main()
