import asyncio
from glob import glob
import json
import websockets
import janus
from trainer import Trainer
from gan import GAN


async def monitorTraining(q, websocket, trainer, shouldStop):
    while True:
        epochData = await q.get()
        await websocket.send(json.dumps({"type": "trainingStatus", "data": epochData}))
        q.task_done()
        if epochData["status"] == "success" or epochData["status"] == "error":
            trainer.join()
            break
        if shouldStop():
            if epochData["status"] == "idle":
                trainer.join()
                break
            else:
                trainer.stop()


async def main(websocket, path):
    shouldStop = False
    async for s in websocket:
        message = json.loads(s)
        if message["action"] == "train":
            queue = janus.Queue()
            trainer = Trainer(GAN, message["parameters"], queue.sync_q)
            trainer.start()
            shouldStop = False
            asyncio.create_task(
                monitorTraining(queue.async_q, websocket, trainer, lambda: shouldStop)
            )
        elif message["action"] == "stop":
            shouldStop = True
        elif message["action"] == "list":
            f = glob("tfjs_models/generator_*.h5/model.json")
            f = sorted(
                f,
                key=lambda x: int(x.split("tfjs_models/generator_")[1].split(".h5")[0]),
            )
            await websocket.send(
                json.dumps(
                    {
                        "type": "models",
                        "data": f,
                    }
                )
            )


if __name__ == "__main__":
    start_server = websockets.serve(main, "localhost", 8765)
    print("...Server Ready!")
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
