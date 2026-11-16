import unittest


class AppVeyorNegativeControl(unittest.TestCase):
    def test_hosted_failure_is_reported(self):
        self.fail("Intentional AppVeyor pilot failure on the control branch")
