import json
import os
from threading import Thread


class Trainer(Thread):
    def __init__(self, Model, parameters, queue):
        Thread.__init__(self)
        self.Model = Model
        self.parameters = parameters
        self.queue = queue
        self.terminated = False

    def stop(self):
        self.terminated = True

    def run(self):
        gan = self.Model()
        with open("training_log.json", "w") as f:
            for i, epochData in enumerate(gan.train(**self.parameters)):
                print(i, epochData)
                self.queue.put(epochData)
                if i == 0:
                    f.write("[\n%s" % json.dumps(epochData))
                else:
                    f.write(",\n%s" % json.dumps(epochData))
                if self.terminated:
                    self.queue.put({"status": "idle"})
                    f.write("%s,\n" % json.dumps({"status": "idle"}))
                    print("Training has been interrupted")
                    break
            f.write("]\n")
